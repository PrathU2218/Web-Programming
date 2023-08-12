document.addEventListener("DOMContentLoaded", function () {
  like = document.querySelectorAll(".liked");
  edit = document.querySelectorAll(".edit");
  text_area = document.querySelectorAll(".textarea");

  like.forEach((element) => {
    element.addEventListener("click", () => {
      handle_like(element);
    });
  });

  edit.forEach((element) => {
    element.addEventListener("click", () => {
      handle_edit(element);
    });
  });

  text_area.forEach((element) => {
    element.addEventListener("keyup", (e) => {
      if (e.keyCode == 13 && e.shiftKey) {
        return;
      }
      if (e.keyCode === 13) {
        handle_edit(element);
      }
    });
  });
});
function edit_post(id, content) {
  form = new FormData();
  form.append("id", id);
  form.append("content", content.trim());

  fetch("/edit_post/", {
    method: "POST",
    body: form,
  }).then((res) => {
    document.querySelector(`#post-content-${id}`).textContent = content;
    document.querySelector(`#post-content-${id}`).style.display = "block";
    document.querySelector(`#post-edit-${id}`).style.display = "none";
    document.querySelector(`#post-edit-${id}`).value = content.trim();
  });
}

function handle_edit(element) {
  id = element.getAttribute("data-id");
  edit_btn = document.querySelector(`#edit-btn-${id}`);
  if (edit_btn.textContent == "Edit") {
    document.querySelector(`#post-content-${id}`).style.display = "none";
    document.querySelector(`#post-edit-${id}`).style.display = "block";
    edit_btn.textContent = "Save";
    edit_btn.setAttribute("class", "text-success edit");
  } else if (edit_btn.textContent == "Save") {
    edit_post(id, document.querySelector(`#post-edit-${id}`).value);

    edit_btn.textContent = "Edit";
    edit_btn.setAttribute("class", "text-primary edit");
  }
}

function handle_like(element) {
  id = element.getAttribute("data-id");
  isLiked = element.getAttribute("data-is-liked");
  count = document.querySelector(`#post-count-${id}`);
//   console.log(isLiked);

  form = new FormData();
  form.append("id", id);
  form.append("isLiked", isLiked);
  fetch("/like/", {
    method: "POST",
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      console.log(res.status_code);
      // if (res.status == 200) {
        document.querySelector(`#post-count-${id}`).textContent = res.likeCount;
        if (isLiked == 'yes') {
          element.className = 'far fa-heart liked';
          element.setAttribute("data-is_liked", "no");
        } else {
          element.className = 'fas fa-heart liked';
          element.setAttribute("data-is_liked", "yes");
        }
      // }
    })
    .catch(function (res) {
      alert("Network Error. Please Check your connection.");
    });
}

