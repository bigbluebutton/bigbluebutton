class SecurityFilters {
    def filters = {
        // Ensure that all controllers and actions require an authenticated user,
        // except for the "public" controller
        auth(controller: "*", action: "*") {
            before = {
                // Exclude the "join" controller.
                if ((controllerName == "join") || (controllerName == "presentation")) return true

                // This just means that the user must be authenticated. He does
                // not need any particular role or permission.
                accessControl { true }
            }
        }

        // Creating, modifying, or deleting a user requires the "Administrator"
        // role.
        userEditing(controller: "user", action: "(create|edit|save|update|delete|list)") {
            before = {
                accessControl {
                    role("Administrator")
                }
            }
        }

        // Showing a user requires the "Administrator" *or* the "User" roles.
        userShow(controller: "user", action: "show") {
            before = {
                accessControl {
                    role("Administrator") || role("User")
                }
            }
        }
    }
}