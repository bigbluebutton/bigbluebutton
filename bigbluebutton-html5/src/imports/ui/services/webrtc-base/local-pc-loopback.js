import MediaStreamUtils from '/imports/utils/media-stream-utils';

export default class LocalPCLoopback {
  constructor(constraints) {
    this.constraints = constraints;
    this.inputStream = null;
    this.localPC = null;
    this.loopbackPC = null;
    this.loopbackStream = new MediaStream();
  }

  _initializeLocalPC() {
    this.localPC = new RTCPeerConnection();
    this.localPC.onicecandidate = (({ candidate }) => {
      if (candidate && this.loopbackPC) {
        this.loopbackPC.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
    this.inputStream.getTracks().forEach((track) => this.localPC.addTrack(track, this.inputStream));
  }

  _initializeLoopbackPC() {
    this.loopbackPC = new RTCPeerConnection();
    this.loopbackPC.onicecandidate = (({ candidate }) => {
      if (candidate && this.localPC) {
        this.localPC.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
    this.loopbackPC.ontrack = (({ streams }) => {
      streams.forEach((stream) => {
        stream.getTracks().forEach((track) => this.loopbackStream.addTrack(track));
      });
    });
  }

  _replaceInputStream(inputStream) {
    let replaced = false;

    if (this.localPC == null || inputStream == null || !inputStream?.active) {
      return Promise.resolve(this.loopbackStream);
    }

    const newTracks = {
      audio: inputStream.getAudioTracks(),
      video: inputStream.getVideoTracks(),
    };
    this.localPC.getSenders().forEach((sender, index) => {
      if (sender.track) {
        const { kind } = sender.track;
        if (this.constraints[kind]) {
          const newTrack = newTracks[kind][index];
          if (newTrack == null) return;
          sender.replaceTrack(newTrack);
          replaced = true;
        }
      }
    });

    if (replaced) this.inputStream = inputStream;

    return Promise.resolve(this.loopbackStream);
  }

  async start(inputStream) {
    if (inputStream == null || !inputStream?.active) throw (new TypeError('Invalid input stream'));

    if (this.localPC && this.loopbackPC) return this._replaceInputStream(inputStream);

    this.inputStream = inputStream;
    const nOptions = {
      offerAudio: this.constraints.audio,
      offerVideo: this.constraints.video,
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    };

    try {
      this._initializeLocalPC();
      this._initializeLoopbackPC();
      const offer = await this.localPC.createOffer(nOptions);
      await this.localPC.setLocalDescription(offer);
      await this.loopbackPC.setRemoteDescription(offer);
      const answer = await this.loopbackPC.createAnswer();
      await this.loopbackPC.setLocalDescription(answer);
      await this.localPC.setRemoteDescription(answer);

      return this.loopbackStream;
    } catch (error) {
      // Rollback
      this.stop();
      throw error;
    }
  }

  stop() {
    if (this.localPC) {
      this.localPC.close();
      this.localPC = null;
    }

    if (this.loopbackPC) {
      this.loopbackPC.close();
      this.loopbackPC = null;
    }

    if (this.loopbackStream) {
      MediaStreamUtils.stopMediaStreamTracks(this.loopbackStream);
      this.loopbackStream = null;
    }
  }
}
