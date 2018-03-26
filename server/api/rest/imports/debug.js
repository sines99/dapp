import { Api } from '../rest.js';

Api.addRoute('debug/mail', {authRequired: false}, {
  get: {
    action: function() {
      const data = {
        "from": "nico@nicokrause.com",
        "subject": "Fancy Newsletter Confirmation",
        "redirect": "http://fancynewsletterconfirmationpage.com",
        "returnPath": "noreply@newsletter.com",
        "content": "<html><body><a href='${confirmation_url}'>Confirmation link</a></body></html>"
      }

     // if(typeof data !='object') {throw "JSON of debug/mail invalid "}


      return {"status": "success", "data": data};
    }
  }
});
