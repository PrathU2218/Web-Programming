document.addEventListener("DOMContentLoaded", function () {
    follow = document.querySelector("#follow-btn").addEventListener("click", handle_follow);
});

function handle_follow() {
    user = document.querySelector("#follow-btn").getAttribute("data-user");
  action = document.querySelector("#follow-btn").textContent.trim();
  form = new FormData();
  form.append("user", user);
  form.append("action", action);
  fetch("/follow/", {
    method: "POST",
    body: form,
  })
    .then((res) => res.json())
    .then((res) => {
      // if (res.status == 200) {
        document.querySelector("#follow-btn").textContent = res.action;
        document.querySelector(
          ".follower-text"
        ).textContent = `Followers: ${res.followerCount}`;
      // }
    });
}
