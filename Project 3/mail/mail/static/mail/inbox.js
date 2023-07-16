document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  const msg = document.querySelector("#message");
  msg.innerHTML = ``;
  const form = document.querySelector("#compose-form");

  form.addEventListener("submit", () => {

    mail_to = document.querySelector("#compose-recipients");
    mail_subject = document.querySelector("#compose-subject");
    mail_body = document.querySelector("#compose-body");

    if (form.length == 0 && mail_to.length == 0) {
      msg.innerHTML = `<div class="alert alert-danger" role="alert"> Please fill out the fields </div>`;
      return;
    }

    fetch(`/emails`, {
      method: "POST",
      body: JSON.stringify({
        recipients: mail_to.value,
        subject: mail_subject.value,
        body: mail_body.value,
      }),
    })
      .then((response) => response.json())
      .then((value) => {
        if (value.status === 200) {
          console.log(`Status is ${value.status}`);
          load_mailbox("sent");
        } else {
          msg.innerHTML = `<div class="alert alert-danger" role="alert"> ${value.error} </div>`;
        }
      });
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Fetch all emails from the API, to show in the inbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      // console.log(`These are emails: ${emails}`);

      sender_recipients = "";
      sen_rec = "";

      emails.forEach((email) => {
        if (mailbox != "sent") {
          sender_recipients = email.sender;
          sen_rec = "Sender:";
        } else {
          sender_recipients = email.recipients;
          sen_rec = "Recipients:";
        }

        is_read = "";

        if (mailbox == "inbox" && email.read) {
          is_read = "read";
        }

        var item = document.createElement("div");

        item.className = `card ${is_read} items`;
        item.innerHTML = `<div class="card-body" id="item-${
          email.id
        }"> Subject: ${
          email.subject
        } <br> ${sen_rec} ${sender_recipients} <br> Time: ${
          email.timestamp
        } <br> ${email.body.slice(0, 100)} </div>`;

        document.querySelector("#emails-view").appendChild(item);

        // This event listener will run the function to open a single email
        item.addEventListener("click", () => {
          open_mail(email.id, mailbox);
        });
      });
    });

  if (mailbox == "open_mail") {
    open_mail();
    return;
  }
}

// To load the email page
function open_mail(id, mailbox) {
  fetch(`emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      document.querySelector("#emails-view").innerHTML = "";

      var item = document.createElement("div");
      item.className = "card";

      item.innerHTML = `<div class="card-body"> Sender:- ${email.sender} <br>Recipients:- ${email.recipients} <br>Subject:- ${email.subject} <br>Timestamp:- ${email.timestamp} <br> ${email.body}`;

      document.querySelector("#emails-view").appendChild(item);

      if (mailbox == "sent") {
        return;
      }

      // Creating the archive button
      let archiveMail = document.createElement("btn");

      archiveMail.className = `btn btn-outline-info`;
      if (email.archived) {
        archiveMail.textContent = "Unarchive";
      } else {
        archiveMail.textContent = "Archive";
      }

      archiveMail.addEventListener("click", () => {
        archive_mail(id, email.archived);
        if (archiveMail.innerText == "Archive") {
          archiveMail.innerText = "Unarchive";
        } else {
          archiveMail.innerText = "Archive";
        }
      });
      document.querySelector("#emails-view").appendChild(archiveMail);

      // Creating the Reply button
      let replyMail = document.createElement("btn");
      replyMail.className = `btn btn-outline-success`;
      replyMail.textContent = "Reply";

      replyMail.addEventListener("click", () => {
        reply_mail(email.sender, email.subject, email.body, email.timestamp);
      });

      document.querySelector("#emails-view").appendChild(replyMail);
      mark_read(id);
    });
}

// Function to archieve the given email
function archive_mail(id, state) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !state,
    }),
  });
}

// Function to mark the given email as read/unread
function mark_read(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

// Function to reply to the sender of the given email
function reply_mail(sender, subject, body, timestamp) {
  compose_email();
  if (!/^Re:/.test(subject)) {
    subject = `Re: ${subject}`;
  }
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;
}
