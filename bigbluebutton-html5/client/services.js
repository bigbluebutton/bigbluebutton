import { Meteor } from 'meteor/meteor';
import Locales from '../imports/locales';

var extend = require('util')._extend;

function loadMessages(defaultMsgs, defaultLocale,  lang, langRegion) {
  let newMessages;

  let langOnly = false;

  let langRegionOnly = false;

  //let localeFound = false;
  //let attempted = false;

  //pt_BR is used for testing.
  /*
  let PT_BR = {
    "app.home.greeting": "Bem-vindo {name}! Sua aprensentação começará em breve...",
    "app.userlist.participantsTitle": "Participantes",
    "app.userlist.messagesTitle": "Mensagens",
    "app.userlist.presenter": "Apresentador",
    "app.userlist.you": "Você",
    "app.chat.submitLabel": "Enviar Mensagem",
    "app.chat.inputLabel": "Campo de mensagem para conversa {name}",
    "app.chat.titlePublic": "Conversa Publíca",
    "app.chat.titlePrivate": "Conversa Privada com {name}",
    "app.chat.partnerDisconnected": "{name} saiu da sala",
    "app.chat.moreMessages": "Mais mensagens abaixo",
    "app.kickMessage": "Você foi expulso da apresentação",
    "app.failedMessage": "Desculpas, estamos com problemas para se conectar ao servidor.",
    "app.connectingMessage": "Conectando...",
    "app.waitingMessage": "Desconectado. Tentando reconectar em {seconds} segundos..."
  }
  */

  //TODO: get ajax calls to work, issue is with the url. doesnt have access to locale .json files
  /*
  while(!localeFound && !attempted){
    $.ajax({
       type: 'GET',
       url: `http://192.168.32.128/bigbluebutton/${langRegion}.json`,
       dataType: 'json',
       success: function (data) {
         //alert("SUCCESS::>  " + data);
         newMessages = data;
         attempted = true;
         localeFound = true;
         langRegionOnly = true;
       },
       error: function (result) {
         alert("Error: Not found, Checking backup");
         $.ajax({
              type: 'GET',
              url: `http://192.168.32.128/bigbluebutton/${lang}.json`,
              dataType: 'json',
              success: function (data) {
                //alert("SUCCESS::>  " + data);
                newMessages = data;
                attempted = true;
                localeFound = true;
                langOnly = true;
              },
              error: function (result) {
                alert("Error: Locale not found, Using Default");
              },
          });
       },
   });
   attempted = true;
  }
  */

  //var combined = extend(defaultMsgs, pt_BR);

  var combined = extend(defaultMsgs, newMessages);

  let results = [];
  if (langOnly) {
    results = [lang, combined];
  }else if (langRegionOnly) {
    results = [langRegion, combined];
  }else {
    results = [defaultLocale, combined];
  }

  return results;
}

export {loadMessages};
