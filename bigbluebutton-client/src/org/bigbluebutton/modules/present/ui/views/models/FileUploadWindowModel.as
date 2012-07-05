package org.bigbluebutton.modules.present.ui.views.models
{
    import org.bigbluebutton.util.i18n.ResourceUtil;

    public class FileUploadWindowModel
    {
        [Bindable]
        public var fileuploadFileLbl:String = ResourceUtil.getInstance().getString('bbb.fileupload.fileLbl')
        
        public function FileUploadWindowModel()
        {
        }
    }
}