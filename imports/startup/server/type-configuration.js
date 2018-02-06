import { Meteor } from 'meteor/meteor';
export const SEND_APP = "send";
export const CONFIRM_APP = "confirm";
export const VERIFY_APP = "verify";
export function isAppType(type) {
  const types = Meteor.settings.app.types;
  if(types !== undefined) return types.includes(type);
  return false;
}
