import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import 'vanilla-cookieconsent';
import { environment } from '../environments';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private document = inject(DOCUMENT);

  get window() {
    return this.document.defaultView;
  }

  constructor() {
    // if(this.window && this.window.initCookieConsent) {
    //   const cc = this.window.initCookieConsent(this.document.body);
    //   cc.run(COOKIE_CONFIG())
    // }
  }
}

const COOKIE_CONFIG = (config: UserConfig = {}): UserConfig => ({
  current_lang: 'en',
  autoclear_cookies: true,                    // default: false
  // cookie_name: 'cc_cookie_demo2',             // default: 'cc_cookie'
  cookie_expiration: 365,                     // default: 182
  // page_scripts: false,                         // default: false
  force_consent: true,                        // default: false

  // auto_language: null,                     // default: null; could also be 'browser' or 'document'
  // autorun: true,                           // default: true
  // delay: 0,                                // default: 0
  // hide_from_bots: false,                   // default: false
  // remove_cookie_tables: false              // default: false
  // cookie_domain: location.hostname,        // default: current domain
  // cookie_path: '/',                        // default: root
  // cookie_same_site: 'Lax',
  // use_rfc_cookie: false,                   // default: false
  // revision: 0,                             // default: 0

  gui_options: {
      consent_modal: {
          layout: 'cloud',                    // box,cloud,bar
          position: 'bottom center',          // bottom,middle,top + left,right,center
          transition: 'slide'                 // zoom,slide
      },
      // settings_modal: {
      //     layout: 'bar',                      // box,bar
      //     position: 'left',                   // right,left (available only if bar layout selected)
      //     transition: 'slide'                 // zoom,slide
      // }
  },

  languages: {
      'en': {
          consent_modal: {
              title: 'Cookies used on the website!',
              description: 'This website uses cookies to offer you a more personalized experience.',
              primary_btn: {
                  text: 'Accept all',
                  role: 'accept_all'      //'accept_selected' or 'accept_all'
              },
              secondary_btn: {
                  text: 'Preferences',
                  role: 'settings'       //'settings' or 'accept_necessary'
              },
              revision_message: 'You can read our updated privacy policy here.'
          },
          settings_modal: {
              title: 'Cookie settings',
              save_settings_btn: 'Save current selection',
              accept_all_btn: 'Accept all',
              reject_all_btn: 'Reject all',
              close_btn_label: 'Close',
              cookie_table_headers: [
                {col1: 'Name'},
                {col2: 'Service'}
            ],
              blocks: [
                {
                  title: 'Analytics cookies',
                  description: 'These cookies help us to improve our website by collecting and reporting information on how you use it.',
                  toggle: {
                      value: 'analytics'
                  },
                  cookie_table: [
                      {
                          col1: '^_ga',
                          col2: 'Google Analytics',
                          col3: 'description ...',
                          is_regex: true
                      },
                      {
                          col1: '_gid',
                          col2: 'Google Analytics',
                          col3: 'description ...',
                      }
                  ]
              }
              ]
          }
      }
  },
  ...config
})
