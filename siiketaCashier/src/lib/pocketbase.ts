import PocketBase from 'pocketbase';
const url = "https://apic.haakudigital.com";
const urlPath = "https://apic.haakudigital.com";
const pb = new PocketBase(url);
pb.autoCancellation(false);
export { pb, urlPath };
