function submitFormOSS() {
  let submitButton = document.getElementById('prbotSubmitOSS');
  let resetButton = document.getElementById('softwareFormReset');
  submitButton.disabled = true;
  resetButton.disabled = true;
  let content =
    '' +
    `---
schemaVersion: "1.0"
description:
  en: ${$('#enDescription').val()}
  fr: ${$('#frDescription').val()}
homepageURL:
  en: ${$('#enHomepageURL').val()}
  fr: ${$('#frHomepageURL').val()}
licenses:
  -
    URL:
      en: ${$('#enUrlLicense').val()}
      fr: ${$('#frUrlLicense').val()}
      spdxID: ${$('#spdxID').val()}
name:
  en: ${$('#enProjectName').val()}
  fr: ${$('#frProjectName').val()}
tags:
  en:
${[...document.querySelectorAll('#tagsEN input')]
  .map(child => child.value)
  .map(tag => '        - "' + tag + '"')
  .join('\n')}
  fr:
${[...document.querySelectorAll('#tagsFR input')]
  .map(child => child.value)
  .map(tag => '        - "' + tag + '"')
  .join('\n')}
admininstrations:
  -
    adminCode: ${$('#adminCode').val()}
    uses:
      -
        contact:
          URL:
            en: ${$('#enUrlContact').val()}
            fr: ${$('#frUrlContact').val()}
            email: ${$('#emailContact').val()}
        date:
          started: ${$('#dateCreated').val()}
          metadataLastUpdated: ${$('#dateLastUpdated').val()}
        name:
          en: ${$('#nameContact').val()}
          phone: ${$('#phoneContact').val()}
`;
  let file = `_data/software/${getSelectedOrgType()}/${$('#adminCode').val()}/${$('#enProjectName').val()}.yml`;

  fetch(PRBOT_URL, {
    body: JSON.stringify({
      user: USERNAME,
      repo: REPO_NAME,
      title: 'Added software for ' + $('#adminCode :selected').text(),
      description:
        'Authored by: ' + $('#submitterEmail').val() + '\n' +
        'Project: ***' + $('#enProjectName').val() + '***\n' +
        $('#enDescription').val() + '\n',
      commit: 'Commited bt ' + $('#submitterEmail').val(),
      author: {
        name: $('#submitterUsername').val(),
        email: $('#submitterEmail').val()
      },
      files: [
        {
          path: file,
          content: YAML.stringify(content, {keepBlobsInJSON: false })
        }
      ]
    }),
    method: 'POST'
  })
  .catch(err => {
    if(err.status == 404) {
      // We need to create the file for this organization, as it doesn't yet exist.
      let header = `schemaVersion: "1.0"\nadminCode: ${$(
        '#adminCode'
      ).val()}\n`;
      fetch(PRBOT_URL, {
        body: JSON.stringify({
          user: USERNAME,
          repo: REPO_NAME,
          title: 'Added software for ' + $('#adminCode :selected').text(),
          description:
            'Authored by: ' + $('#submitterEmail').val() + '\n' +
            'Project: ***' + $('#enProjectName').val() + '***\n' +
            $('#enDescription').val() + '\n',
          commit: 'Commited bt ' + $('#submitterEmail').val(),
          author: {
            name: $('#submitterUsername').val(),
            email: $('#submitterEmail').val()
          },
          files: [
            {
              path: file,
              content: header + content
            }
          ]
        }),
        method: 'POST'
      });
    } else {
      throw err;
    }
  })
  .then(response => {
    if (response.status != 200) {
      toggleAlert(ALERT_OFF);
      toggleAlert(ALERT_FAIL);
      submitButton.disabled = false;
      resetButton.disabled = false;
    } else {
      toggleAlert(ALERT_OFF);
      toggleAlert(ALERT_SUCCESS);
      // redirect to home page
      setTimeout(function {
        window.location.href = './index.html';
      }, 2000);
    }
  });
}