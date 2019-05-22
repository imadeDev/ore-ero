function submitFormOSS() {
  let submitButton = document.getElementById('prbotSubmitOSS');
  let resetButton = document.getElementById('softwareFormReset');
  submitButton.disabled = true;
  resetButton.disabled = true;
  let content =
    '' +
    `admininstrations:
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
  let fileWriter = new YamlWriter(USERNAME, REPO_NAME);
  let file = `_data/logiciels_libres-open_source_software/${$('#enProjectName').val()}.yml`;
  fileWriter
    .merge(file, content, 'admininstrations', 'name.en')
    .then(result => {
      const config = {
        body: JSON.stringify({
          user: USERNAME,
          repo: REPO_NAME,
          title: 'Updated code for ' + $('#enProjectName').val(),
          description:
            'Authored by: ' + $('#submitterEmail').val() + '\n' +
            'Project: ***' + $('#enProjectName').val() + '***\n' +
            $('#enDescription').val() + '\n',
          commit: 'Commited by ' + $('submitterEmail').val(),
          author: {
            name: $('submitterUsername').val(),
            email: $('submitterEmail').val()
          },
          files: [
            {
              path: file,
              content: YAML.stringify(result, {keepBlobsInJSON: false})
            }
          ]
        }),
        method: 'POST'
      };
      return fetch(PRBOT_URL, config);
    })
    .catch(err => {
      if(err.status == 404) {
        // We need to create the file for this project, as it doesn't yet exists.
        let header = `---
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
            .join('\n')}`;
        const config = {
          body: JSON.stringify({
            user: USERNAME,
            repo: REPO_NAME,
            title: 'Created software file for ' + $('#enProjectName').val(),
            description:
              'Authored by: ' + $('#submitterEmail').val() + '\n' +
              'Project: ***' + $('#enProjectName').val() + '***\n' +
              $('#enDescription').val() + '\n',
            commit: 'Committed by ' + $('#submitterEmail').val(),
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
        };
        return fetch(PRBOT_URL, config);
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
        // Redirect to home page
        setTimeout(function() {
          window.location.href = './index.html';
        }, 2000);
      }
    });
}