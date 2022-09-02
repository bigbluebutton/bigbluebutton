import Presentations from '/imports/api/presentations';
import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import Icon from '/imports/ui/components/common/icon/component';
import { makeCall } from '/imports/ui/services/api';
import Styled from '/imports/ui/components/presentation/presentation-uploader/styles';
import { toast } from 'react-toastify';
import { defineMessages } from 'react-intl';
import _ from 'lodash';
import { UploadingPresentations } from '/imports/api/presentations';

const intlMessages = defineMessages({

	item: {
		id: 'app.presentationUploder.item',
		description: 'single item label',
	},
	itemPlural: {
		id: 'app.presentationUploder.itemPlural',
		description: 'plural item label',
	},
	uploading: {
		id: 'app.presentationUploder.uploading',
		description: 'uploading label for toast notification',
	},
	uploadStatus: {
		id: 'app.presentationUploder.uploadStatus',
		description: 'upload status for toast notification',
	},
	completed: {
		id: 'app.presentationUploder.completed',
		description: 'uploads complete label for toast notification',
	},
	GENERATING_THUMBNAIL: {
		id: 'app.presentationUploder.conversion.generatingThumbnail',
		description: 'indicatess that it is generating thumbnails',
	},
	GENERATING_SVGIMAGES: {
		id: 'app.presentationUploder.conversion.generatingSvg',
		description: 'warns that it is generating svg images',
	},
	GENERATED_SLIDE: {
		id: 'app.presentationUploder.conversion.generatedSlides',
		description: 'warns that were slides generated',
	},
	PAGE_COUNT_EXCEEDED: {
		id: 'app.presentationUploder.conversion.pageCountExceeded',
		description: 'warns the user that the conversion failed because of the page count',
	},
	PDF_HAS_BIG_PAGE: {
		id: 'app.presentationUploder.conversion.pdfHasBigPage',
		description: 'warns the user that the conversion failed because of the pdf page siz that exceeds the allowed limit',
	},
	OFFICE_DOC_CONVERSION_INVALID: {
		id: 'app.presentationUploder.conversion.officeDocConversionInvalid',
		description: '',
	},
	OFFICE_DOC_CONVERSION_FAILED: {
		id: 'app.presentationUploder.conversion.officeDocConversionFailed',
		description: 'warns the user that the conversion failed because of wrong office file',
	},
	UNSUPPORTED_DOCUMENT: {
		id: 'app.presentationUploder.conversion.unsupportedDocument',
		description: 'warns the user that the file extension is not supported',
	},
	fileToUpload: {
		id: 'app.presentationUploder.fileToUpload',
		description: 'message used in the file selected for upload',
	},
	uploadProcess: {
		id: 'app.presentationUploder.upload.progress',
		description: 'message that indicates the percentage of the upload',
	},
	badConnectionError: {
		id: 'app.presentationUploder.connectionClosedError',
		description: 'message indicating that the connection was closed',
	},
	conversionProcessingSlides: {
		id: 'app.presentationUploder.conversion.conversionProcessingSlides',
		description: 'indicates how many slides were converted',
	},
	genericError: {
		id: 'app.presentationUploder.genericError',
		description: 'generic error while uploading/converting',
	},
	genericConversionStatus: {
		id: 'app.presentationUploder.conversion.genericConversionStatus',
		description: 'indicates that file is being converted',
	},
});  

function renderPresentationItemStatus(item, intl) {
	if ((("progress" in item) && item.progress === 0) || (("upload" in item) && item.upload.progress === 0)) {
		return intl.formatMessage(intlMessages.fileToUpload);
	}

	if (("progress" in item) && item.progress < 100 && !("conversion" in item)) {
		return intl.formatMessage(intlMessages.uploadProcess, {
			0: Math.floor(item.progress).toString(),
		});
	}

	const constraint = {};

	if (("upload" in item) && (item.upload.done && item.upload.error)) {
		if (item.conversion.status === 'FILE_TOO_LARGE') {
			constraint['0'] = ((item.conversion.maxFileSize) / 1000 / 1000).toFixed(2);
		}

		if (item.progress < 100) {
			const errorMessage = intlMessages.badConnectionError;
			return intl.formatMessage(errorMessage);
		}

		const errorMessage = intlMessages[item.upload.status] || intlMessages.genericError;
		return intl.formatMessage(errorMessage, constraint);
	}

	if (("conversion" in item) && (!item.conversion.done && item.conversion.error)) {
		const errorMessage = intlMessages[item.conversion.status] || intlMessages.genericConversionStatus;

		switch (item.conversion.status) {
			case 'PAGE_COUNT_EXCEEDED':
				constraint['0'] = item.conversion.maxNumberPages;
				break;
			case 'PDF_HAS_BIG_PAGE':
				constraint['0'] = (item.conversion.bigPageSize / 1000 / 1000).toFixed(2);
				break;
			default:
				break;
		}

		return intl.formatMessage(errorMessage, constraint);
	}

	if ((("conversion" in item) && (!item.conversion.done && !item.conversion.error)) || (("progress" in item) && item.progress == 100)) {
		let conversionStatusMessage
		if ("conversion" in item) {
				if (item.conversion.pagesCompleted < item.conversion.numPages) {
				return intl.formatMessage(intlMessages.conversionProcessingSlides, {
					0: item.conversion.pagesCompleted,
					1: item.conversion.numPages,
				});
			}

			conversionStatusMessage = intlMessages[item.conversion.status]
				|| intlMessages.genericConversionStatus;
		} else {
			conversionStatusMessage = intlMessages.genericConversionStatus;
		}
		return intl.formatMessage(conversionStatusMessage);
	}

	return null;
}
  
function renderToastItem(item, intl) {

	const isUploading = ("progress" in item) && item.progress <= 100;
	const isConverting = ("conversion" in item) && !item.conversion.done;
	const hasError = ((("conversion" in item) && item.conversion.error) || (("upload" in item) && item.upload.error));
	const isProcessing = (isUploading || isConverting) && !hasError;

	let icon = isProcessing ? 'blank' : 'check';
	if (hasError) icon = 'circle_close';

	return (
		<Styled.UploadRow
			key={item.temporaryPresentationId}
			onClick={() => {
				if (hasError || isProcessing) Session.set('showUploadPresentationView', true);
			}}
		>
			<Styled.FileLine>
				<span>
					<Icon iconName="file" />
				</span>
				<Styled.ToastFileName>
					<span>{item.filename || item.name}</span>
				</Styled.ToastFileName>
				<Styled.StatusIcon>
					<Styled.ToastItemIcon
						done={!isProcessing && !hasError}
						error={hasError}
						loading={ isProcessing }
						iconName={icon}
					/>
				</Styled.StatusIcon>
			</Styled.FileLine>
			<Styled.StatusInfo>
				<Styled.StatusInfoSpan data-test="presentationStatusInfo" styles={hasError ? 'error' : 'info'}>
					{renderPresentationItemStatus(item, intl)}
				</Styled.StatusInfoSpan>
			</Styled.StatusInfo>
		</Styled.UploadRow>
	);
}
  
const renderToastList = (presentations, intl) => {
  
	let converted = 0;

	let presentationsSorted = presentations
		.sort((a, b) => a.uploadTimestamp - b.uploadTimestamp)
		.sort((a, b) => {
			const presADone = a.conversion ? a.conversion.done : false;
			const presBDone = b.conversion ? b.conversion.done : false;

			return presADone - presBDone
		});

	presentationsSorted
		.forEach((p) => {
			const presDone = p.conversion ? p.conversion.done : false;
			if (presDone) converted += 1;
			return p;
		});

	let toastHeading = '';
	const itemLabel = presentationsSorted.length > 1
		? intl.formatMessage(intlMessages.itemPlural)
		: intl.formatMessage(intlMessages.item);

	if (converted === 0) {
		toastHeading = intl.formatMessage(intlMessages.uploading, {
			0: presentationsSorted.length,
			1: itemLabel,
		});
	}

	if (converted > 0 && converted !== presentationsSorted.length) {
		toastHeading = intl.formatMessage(intlMessages.uploadStatus, {
			0: converted,
			1: presentationsSorted.length,
		});
	}

	if (converted === presentationsSorted.length) {
		toastHeading = intl.formatMessage(intlMessages.completed, {
			0: converted,
		});
	}

	return (
		<Styled.ToastWrapper>
			<Styled.UploadToastHeader>
				<Styled.UploadIcon iconName="upload" />
				<Styled.UploadToastTitle>{toastHeading}</Styled.UploadToastTitle>
			</Styled.UploadToastHeader>
			<Styled.InnerToast>
				<div>
					<div>
						{presentationsSorted.map((item) => renderToastItem(item, intl))}
					</div>
				</div>
			</Styled.InnerToast>
		</Styled.ToastWrapper>
	);
}


function handleDismissToast(toastId) {
    return toast.dismiss(toastId);
}

const alreadyRenderedPresList = []
export const ToastController = ({ intl }) => {

	useTracker(() => {

		const presentationsRenderedFalseAndConversionFalse = Presentations.find({ $or: [{renderedInToast: false}, {"conversion.done": false}] }).fetch();
		const convertingPresentations = presentationsRenderedFalseAndConversionFalse.filter(p => !p.renderedInToast )
		let tmpIdconvertingPresentations = presentationsRenderedFalseAndConversionFalse.filter(p => !p.conversion.done)
			.map(p => p.temporaryPresentationId)
		UploadingPresentations.find({}).fetch().filter(p => tmpIdconvertingPresentations.includes(p.temporaryPresentationId))
			.map(p => {
				return UploadingPresentations.remove({temporaryPresentationId: p.temporaryPresentationId})});
		const uploadingPresentations = UploadingPresentations.find().fetch();
		let presentationsToConvert = convertingPresentations.concat(uploadingPresentations);

		presentationsToConvert.map(p => p.temporaryPresentationId).forEach(tmpId => {
			if (!alreadyRenderedPresList.some(pres => pres.temporaryPresentationId == tmpId)){
				alreadyRenderedPresList.push({
					temporaryPresentationId: tmpId,
					rendered: false,
				});
			}
		})
		let activeToast = Session.get("presentationUploaderToastId");
		const showToast = presentationsToConvert.length > 0;
		if (showToast && !activeToast) {
			activeToast = toast.info(() => renderToastList(presentationsToConvert, intl), {
				hideProgressBar: true,
				autoClose: false,
				newestOnTop: true,
				closeOnClick: true,
				onClose: () => {
					Session.set("presentationUploaderToastId", null);
					presentationsToConvert = [];
				},
			});
			Session.set("presentationUploaderToastId", activeToast);
		} else if (!showToast && activeToast) {
			handleDismissToast(activeToast);
			Session.set("presentationUploaderToastId", null);
		} else {
			toast.update(activeToast, {
				render: renderToastList(presentationsToConvert, intl),
			});
		}

		let temporaryPresentationIdListToSetAsRendered = presentationsToConvert.filter(p => 
			("conversion" in p && (p.conversion.done || p.conversion.error)))
			
		temporaryPresentationIdListToSetAsRendered = temporaryPresentationIdListToSetAsRendered.map(p => {
			index = alreadyRenderedPresList.findIndex(pres => pres.temporaryPresentationId === p.temporaryPresentationId);
			if (index !== -1) {
				alreadyRenderedPresList[index].rendered = true;
			}
			return p.temporaryPresentationId
		});

		if (alreadyRenderedPresList.every((pres) => pres.rendered)) {
			makeCall('setPresentationRenderedInToast');
			alreadyRenderedPresList.length = 0;
		}
		
	}, [])
	return null;
}

export default {
	handleDismissToast,
	renderPresentationItemStatus,
}
