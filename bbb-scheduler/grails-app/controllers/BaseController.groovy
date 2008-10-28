
abstract class BaseController {
	def auth() {
		if (!session.email) {
			def originalRequestParams =
				[controller:controllerName,
					action:actionName]
					
			originalRequestParams.putAll(params)
			
			session.originalRequestParams = originalRequestParams
			
			redirect(url:"http://www.volunteerottawa.ca/vo-clean/index.php?/eng/user/login")
			return false
		}
	}
}