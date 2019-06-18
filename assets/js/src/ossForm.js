function getOssObject() {
    // Required fields are included first.
    let ossObject = {
      schemaVersion: $('#schemaVersion').val(),
      description: {
        en: $('#enDescription').val(),
        fr: $('#frDescription').val()
      },
      homepageURL: {
        en: $('#enHomepageUrl').val(),
        fr: $('#frHomepageUrl').val()
      },
      licenses: [
        {
          URL: {
            en: $('#enLicenses').val(),
            fr: $('#frLicenses').val()
          },
          spdxID: $('#spdxID').val()
        }
      ],
      name: {
        en: $('#enProjectName').val(),
        fr: $('#frProjectName').val()
      },
      tags: {
        en: getTags([...document.querySelectorAll('#tagsEN input')]),
        fr: getTags([...document.querySelectorAll('#tagsFR input')])
      },
      administrations: [
        {
          adminCode: $('#adminCode').val(),
          uses: [
            {
              contact: {
                email: $('#emailContact').val()
              },
              date: {
                started: $('#dateStarted')
                  .val()
                  .toString(),
                metadataLastUpdated: $('#dateLastUpdated')
                  .val()
                  .toString()
              },
              description: {
                en: $('#enUseDescription').val(),
                fr: $('#enUseDescription').val()
              },
              name: {
                en: $('#enUseName').val(),
                fr: $('#frUseName').val()
              },
            }
          ]
        }
      ]
    };

    // Then we handle all optional fields.

    // contact.URL
    if ($('#frUrlContact').val() || $('#enUrlContact').val()) {
      ossObject.administrations[0].uses[0].contact.URL = {};
    }
    if ($('#enUrlContact').val()) {
      ossObject.administrations[0].uses[0].contact.URL.en = $('#enUrlContact').val();
    }
    if ($('#frUrlContact').val()) {
      ossObject.administrations[0].uses[0].contact.URL.fr = $('#frUrlContact').val();
    }

    // contact.name, TODO: update to match schema
    if ($('#nameContact').val()) {
      ossObject.administrations[0].uses[0].contact.name = $('#nameContact').val();
    }

    // relatedCode TODO: support multiple relatedCode fields
    if (
      $('#enUrlRelatedCode').val() ||
      $('#frUrlRelatedCode').val() ||
      $('#enNameRelatedCode').val() ||
      $('#frNameRelatedCode').val()
    ) {
      ossObject.administrations[0].uses[0].relatedCode = [{}];
    }
    // relatedCode.URL
    if ($('#enUrlRelatedCode').val() || $('#frUrlRelatedCode').val()) {
      ossObject.administrations[0].uses[0].relatedCode[0].URL = {};
    }
    if ($('#enUrlRelatedCode').val()) {
      ossObject.administrations[0].uses[0].relatedCode[0].URL.en = $('#enUrlRelatedCode').val();
    }
    if ($('#frUrlRelatedCode').val()) {
      ossObject.administrations[0].uses[0].relatedCode[0].URL.fr = $('#frUrlRelatedCode').val();
    }
    // relatedCode.name
    if ($('#enNameRelatedCode').val() || $('#frNameRelatedCode').val()) {
      ossObject.administrations[0].uses[0].relatedCode[0].name = {};
    }
    if ($('#enNameRelatedCode').val()) {
      ossObject.administrations[0].uses[0].relatedCode[0].name.en = $(
        '#enNameRelatedCode'
      ).val();
    }
    if ($('#frNameRelatedCode').val()) {
      ossObject.administrations[0].uses[0].relatedCode[0].name.fr = $(
        '#frNameRelatedCode'
      ).val();
    }

    // status
    if ($('#status :selected').val() != '') {
      ossObject.administrations[0].uses[0].status = $('#status :selected').val();
    }

    return ossObject;
  }

  function submitFormOss() {
    let submitButton = document.getElementById('prbotSubmitossForm');
    let resetButton = document.getElementById('formReset');
    submitButton.disabled = true;
    resetButton.disabled = true;
    let ossObject = getOssObject();
    let fileWriter = new YamlWriter(USERNAME, REPO_NAME);
    let ProjectName =$('#enProjectName').val().toLowerCase();
    let file = `_data/logiciels_libres-open_source_software/${ProjectName}.yml`;
    fileWriter
      .merge(file, ossObject, 'administrations', 'adminCode')
      .then(result => {
        console.log(result);
        const config = {
          body: JSON.stringify({
            user: USERNAME,
            repo: REPO_NAME,
            title: `Updated software for ${ProjectName} `,
            description:
              'Authored by: ' +
              $('#submitterEmail').val() +
              '\n' +
              'Project: ***' +
              $('#enProjectName').val() +
              '***\n' +
              $('#enDescription').val() +
              '\n',
            commit: 'Committed by ' + $('#submitterEmail').val(),
            author: {
              name: $('#submitterUsername').val(),
              email: $('#submitterEmail').val()
            },
            files: [
              {
                path: file,
                content: jsyaml.dump(result, { lineWidth: 160 })
              }
            ]
          }),
          method: 'POST'
        };
        return fetch(PRBOT_URL, config);
      })
      .catch(err => {
        if (err.status == 404) {
          // We need to create the file for this organization, as it doesn't yet exist.
          const config = {
            body: JSON.stringify({
              user: USERNAME,
              repo: REPO_NAME,
              title: 'Created the software file for ' + ProjectName ,
              description:
                'Authored by: ' +
                $('#submitterEmail').val() +
                '\n' +
                'Project: ***' +
                $('#enProjectName').val() +
                '***\n' +
                $('#enDescription').val() +
                '\n',
              commit: 'Committed by ' + $('#submitterEmail').val(),
              author: {
                name: $('#submitterUsername').val(),
                email: $('#submitterEmail').val()
              },
              files: [
                {
                  path: file,
                  content:
                    '---\n' +
                    jsyaml.dump(ossObject, {
                      lineWidth: 160
                    })
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