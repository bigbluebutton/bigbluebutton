import { CircularProgress } from "@material-ui/core";
import React, { useRef, useState } from "react";
import useDrivePicker from "react-google-drive-picker";
import { toast } from "react-toastify";
import Icon from "/imports/ui/components/common/icon/component";
import { Meteor } from "meteor/meteor";

function GoogleDriveUploader({ onSelectFiles }) {
  const GOOGLE_CLIENT_ID = Meteor.settings.public.app.googleClientID;
  const GOOGLE_DEV_KEY = Meteor.settings.public.app.googleDevKey;

  const [openPicker, authResponse] = useDrivePicker({ setOwnedByMe: true });
  const [loading, setLoading] = useState(false);
  const BASE_NAME = Meteor.settings.public.app.basename;
  const ICONS_PATH = `${BASE_NAME}/resources/images/icons`;
  const toastId = useRef(null);

  const handleOpenPicker = () => {
    openPicker({
      customScopes: ["https://www.googleapis.com/auth/drive.readonly"],
      clientId: GOOGLE_CLIENT_ID,
      developerKey: GOOGLE_DEV_KEY,
      viewId: "DOCS",
      token: authResponse?.access_token || "",
      supportDrives: true,
      multiselect: true,
      setIncludeFolders: true,
      // customViews: customViewsArray, // custom view
      callbackFunction: async (data) => {
        if (data.action === "cancel") {
          // console.log('User clicked cancel/close button');
        }
        if (data.docs?.length > 0) {
          const choosenFiles = data.docs.map(({ name, id, isShared }) => ({
            url: `https://drive.google.com/u/0/uc?id=${id}`,
            name,
            id,
            isShared: isShared || false,
          }));
          toastId.current = toast.info(
            <div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={14} />
                <h3 style={{ marginLeft: 10 }}>Downloading files...</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {choosenFiles.map((file) => (
                  <div
                    style={{
                      padding: "5px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Icon iconName="file" />
                    <span>
                      {file.name}{" "}
                      {!file.isShared && (
                        <span style={{ color: "red" }}>
                          (not shared - download failed)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>,
            {
              autoClose: false,
            }
          );
          const res = await onSelectFiles(choosenFiles);
          toast.info(res?.message, { autoClose: 3000 });
          toast.dismiss(toastId.current);
        }
      },
    });
  };

  return (
    <div
      onClick={() => handleOpenPicker()}
      style={{
        borderRadius: 5,
        backgroundColor: "#f1f1f1",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "2px 2px 2px 2px #0f70d7",
        },
      }}
    >
      <img
        src={`${ICONS_PATH}/google_drive.png`}
        alt="Google drive"
        width={100}
        height={100}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

export default GoogleDriveUploader;
