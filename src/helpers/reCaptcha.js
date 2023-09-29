export default {
  executeWithRecaptcha: (actionName, callback) => {
    grecaptcha.ready(function () {
      grecaptcha
        .execute(import.meta.env.VITE_RECAPTCHA_KEY, {
          action: actionName || 'submit',
        })
        .then((token) => {
          callback(token);
        });
    });
  }
}

window.dataLayer = window.dataLayer || [];
