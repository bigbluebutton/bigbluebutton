const ARIA_ALERT_TIMEOUT = 3000;

export const alertScreenReader = (s = '') => {
    const app = document.getElementById('app');
    const ariaAlert = document.createElement("div"); 
    ariaAlert.setAttribute("id", "aria-alert"); 
    ariaAlert.setAttribute("role", "alert"); 
    ariaAlert.setAttribute("aria-hidden", false);
    ariaAlert.setAttribute("className", "sr-only");
    ariaAlert.textContent = s;
    app.appendChild(ariaAlert);

    setTimeout(() => {
        document.getElementById('aria-alert').remove();
    }, ARIA_ALERT_TIMEOUT);
};

export default { alertScreenReader }; 