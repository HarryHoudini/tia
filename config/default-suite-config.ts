'use strict';

// Default suite config.
// These options are not overrided by directories configs.
const defaultSuiteConfig = {

  // Should TIA write info about directories without tests (or with skip: true) into summary log.
  emptyDirToSuiteLog: false,

  // IF true - TIA prints detailed log with timings to stdout.
  suiteLogToStdout: true,

  // Need you to attach zip with test dir to the mail
  attachArchiveToMail: true,

  // Only diffs in attachment ?
  attachOnlyDiffs: true,

  // Remove zip after sending mail.
  removeZipAfterSend: true,

  // The URL for remote web driver.
  remoteDriverUrl: 'http://localhost',

  // The Port for remote web driver.
  remoteDriverPort: 9515,

  // Note: use tia-suite-config.js to specify email parameters.

  // To whom TIA should send emails.
  mailRecipientList: '',

  // smtp host, e.g. smtp.yandex.ru
  mailSmtpHost: '',

  // user to send mail on behalf of.
  mailUser: '',

  // password of the user to send mail on behalf of.
  mailPassword: '',
};

export default defaultSuiteConfig;
