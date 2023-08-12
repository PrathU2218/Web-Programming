document.addEventListener("DOMContentLoaded", function () {
    post_btn = document.querySelector("#add-btn").addEventListener("click", handle_post);
});

function handle_post() {
    contentArea = document.querySelector("#add-text");
    content = contentArea.value;

    if (content != '') {
        form = new FormData();
        form.append("content", content.trim());
        fetch("/addpost/", {
          method: "POST",
          body: form,
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res.username);
            // if (res.status == 200) {
                console.log('api returned')
              contentArea.value = "";

              new_post = document.querySelector("#root");

              new_post.innerHTML = `<div class="card post">
              <div class="post-user-edit">
                <a href="{% url 'profile' ${res.username}%}" id="username"
                  >${res.username}</a
                >
                
                <span
                  class="text-primary edit"
                  data-id="${res.postId}"
                  id="edit-btn-${res.postId}"
                  >Edit</span
                >
                
              </div>
              <div id="post-content-${res.postId}" class="content">${content}</div>
              <div>${res.timestamp}</div>
              <div>
                <i
                data-id="${res.postId}"
                id="post-like-${res.postId} liked"

           
                  class="far fa-heart liked"
                  data-is-liked="no"
  
                  style="color: red"
                ></i>
                <strong id="post-count-${res.postId}">${res.likes}</strong>
              </div>
            </div>
            `;
            // }
          });
    } 
}