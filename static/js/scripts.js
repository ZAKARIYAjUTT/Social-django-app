document.addEventListener('DOMContentLoaded', function () {
    const tokenUrl = 'http://127.0.0.1:8000/api/token/';
    const registerUrl = 'http://127.0.0.1:8000/api/v1/register/';
    const profileBaseUrl = 'http://127.0.0.1:8000/api/v1/profile/';
    const postsUrl = 'http://127.0.0.1:8000/api/v1/posts/';
    const followUrl = 'http://127.0.0.1:8000/api/v1/follow/';
    const commentsUrl = 'http://127.0.0.1:8000/api/v1/comments/';
    const messagesUrl = 'http://127.0.0.1:8000/api/v1/messages/';
    const contentDiv = document.getElementById('content');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const profileLink = document.getElementById('profile-link');
    const postsLink = document.getElementById('posts-link');
    const followLink = document.getElementById('follow-link');
    const messagesLink = document.getElementById('messages-link');

    function getToken() {
        return localStorage.getItem('token');
    }

    function setToken(token) {
        localStorage.setItem('token', token);
    }

    function setUserId(userId) {
        localStorage.setItem('user_id', userId);
    }

    function getUserId() {
        return localStorage.getItem('user_id');
    }

    function fetchWithAuth(url, options) {
        options = options || {};
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + getToken();
        return fetch(url, options);
    }

    function login(username, password) {
        fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                setToken(data.access);
                setUserId(data.user_id);  // Assuming user_id is returned in the response
                showProfile();
            } else {
                alert('Login failed');
            }
        });
    }

    function register(username, password, email) {
        fetch(registerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                alert('Registration successful. Please login.');
                showLoginForm();
            } else {
                alert('Registration failed');
            }
        });
    }

    function showProfile() {
        const userId = getUserId();
        fetchWithAuth(profileBaseUrl + userId + '/')
            .then(response => response.json())
            .then(data => {
                contentDiv.innerHTML = `
                    <h2>Welcome, ${data.user.username}</h2>
                    <p>Bio: ${data.bio}</p>
                    <img src="${data.profile_picture}" alt="Profile Picture" width="100">
                    <button id="update-profile" class="btn btn-warning">Update Profile</button>
                `;
                document.getElementById('update-profile').addEventListener('click', function () {
                    showUpdateProfileForm(data);
                });
                loginLink.style.display = 'none';
                registerLink.style.display = 'none';
                profileLink.style.display = 'inline';
                postsLink.style.display = 'inline';
                followLink.style.display = 'inline';
                messagesLink.style.display = 'inline';
            });
    }

    function showUpdateProfileForm(profile) {
        contentDiv.innerHTML = `
            <h2>Update Profile</h2>
            <form id="update-profile-form" class="form">
                <div class="form-group">
                    <label for="bio">Bio:</label>
                    <input type="text" id="bio" name="bio" class="form-control" value="${profile.bio}">
                </div>
                <div class="form-group">
                    <label for="profile_picture">Profile Picture:</label>
                    <input type="file" id="profile_picture" name="profile_picture" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Update</button>
            </form>
        `;
        document.getElementById('update-profile-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const bio = document.getElementById('bio').value;
            const profilePicture = document.getElementById('profile_picture').files[0];
            updateProfile(profile.id, bio, profilePicture);
        });
    }

    function updateProfile(profileId, bio, profilePicture) {
        const formData = new FormData();
        formData.append('bio', bio);
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }
        fetchWithAuth(profileBaseUrl + profileId + '/', {
            method: 'PUT',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Profile updated successfully');
            showProfile();
        });
    }

    function showLoginForm() {
        contentDiv.innerHTML = `
            <h2>Login</h2>
            <form id="login-form" class="form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" class="form-control">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        `;

        document.getElementById('login-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            login(username, password);
        });
    }

    function showRegisterForm() {
        contentDiv.innerHTML = `
            <h2>Register</h2>
            <form id="register-form" class="form">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" class="form-control">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" class="form-control">
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Register</button>
            </form>
        `;

        document.getElementById('register-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const email = document.getElementById('email').value;
            register(username, password, email);
        });
    }

    function showPosts() {
        fetchWithAuth(postsUrl)
            .then(response => response.json())
            .then(data => {
                let postsHtml = '<h2>Posts</h2>';
                postsHtml += '<button id="create-post" class="btn btn-success mb-3">Create Post</button>';
                postsHtml += '<ul class="list-group">';
                data.forEach(post => {
                    postsHtml += `
                        <li class="list-group-item">
                            <h3>${post.title}</h3>
                            <p>${post.content}</p>
                            <div>
                                <button class="btn btn-info update-post" data-id="${post.id}">Update</button>
                                <button class="btn btn-danger delete-post" data-id="${post.id}">Delete</button>
                                <button class="btn btn-primary like-post" data-id="${post.id}">Like (${post.likes_count})</button>
                                <button class="btn btn-secondary share-post" data-id="${post.id}">Share (${post.shares_count})</button>
                                <button class="btn btn-light comment-post" data-id="${post.id}">Comment</button>
                            </div>
                            <ul class="list-group mt-3" id="comments-${post.id}">
                                ${post.comments.map(comment => `
                                    <li class="list-group-item">
                                        <strong>${comment.user.username}</strong>: ${comment.content}
                                        <button class="btn btn-sm btn-primary like-comment" data-id="${comment.id}">Like (${comment.likes_count})</button>
                                    </li>
                                `).join('')}
                            </ul>
                        </li>
                    `;
                });
                postsHtml += '</ul>';
                contentDiv.innerHTML = postsHtml;

                document.getElementById('create-post').addEventListener('click', showCreatePostForm);
                document.querySelectorAll('.update-post').forEach(button => {
                    button.addEventListener('click', function () {
                        const postId = this.getAttribute('data-id');
                        showUpdatePostForm(postId);
                    });
                });
                document.querySelectorAll('.delete-post').forEach(button => {
                    button.addEventListener('click', function () {
                        const postId = this.getAttribute('data-id');
                        deletePost(postId);
                    });
                });
                document.querySelectorAll('.like-post').forEach(button => {
                    button.addEventListener('click', function () {
                        const postId = this.getAttribute('data-id');
                        likePost(postId);
                    });
                });
                document.querySelectorAll('.share-post').forEach(button => {
                    button.addEventListener('click', function () {
                        const postId = this.getAttribute('data-id');
                        sharePost(postId);
                    });
                });
                document.querySelectorAll('.comment-post').forEach(button => {
                    button.addEventListener('click', function () {
                        const postId = this.getAttribute('data-id');
                        showCommentForm(postId);
                    });
                });
                document.querySelectorAll('.like-comment').forEach(button => {
                    button.addEventListener('click', function () {
                        const commentId = this.getAttribute('data-id');
                        likeComment(commentId);
                    });
                });
            });
    }

    function showCreatePostForm() {
        contentDiv.innerHTML = `
            <h2>Create Post</h2>
            <form id="create-post-form" class="form">
                <div class="form-group">
                    <label for="title">Title:</label>
                    <input type="text" id="title" name="title" class="form-control">
                </div>
                <div class="form-group">
                    <label for="content">Content:</label>
                    <textarea id="content" name="content" class="form-control"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Create</button>
            </form>
        `;

        document.getElementById('create-post-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            createPost(title, content);
        });
    }

function createPost(title, content) {
    const userId = getUserId(); // Get the user ID from local storage
    const payload = { title, content };
    console.log('Payload:', payload); // Log the payload
    fetchWithAuth(postsUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload) // Send title and content
    })
    .then(response => response.json())
    .then(data => {
        console.log('Create Post Response:', data); // Log the response
        if (data.id) {
            alert('Post created successfully');
            showPosts();
        } else {
            alert('Failed to create post');
        }
    })
    .catch(error => console.error('Error creating post:', error));
}


    function showUpdatePostForm(postId) {
        fetchWithAuth(postsUrl + postId + '/')
            .then(response => response.json())
            .then(data => {
                contentDiv.innerHTML = `
                    <h2>Update Post</h2>
                    <form id="update-post-form" class="form">
                        <div class="form-group">
                            <label for="title">Title:</label>
                            <input type="text" id="title" name="title" class="form-control" value="${data.title}">
                        </div>
                        <div class="form-group">
                            <label for="content">Content:</label>
                            <textarea id="content" name="content" class="form-control">${data.content}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Update</button>
                    </form>
                `;

                document.getElementById('update-post-form').addEventListener('submit', function (event) {
                    event.preventDefault();
                    const title = document.getElementById('title').value;
                    const content = document.getElementById('content').value;
                    updatePost(postId, title, content);
                });
            });
    }

    function updatePost(postId, title, content) {
        fetchWithAuth(postsUrl + postId + '/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        })
        .then(response => response.json())
        .then(data => {
            alert('Post updated successfully');
            showPosts();
        });
    }

    function deletePost(postId) {
        fetchWithAuth(postsUrl + postId + '/', {
            method: 'DELETE'
        })
        .then(response => {
            if (response.status === 204) {
                alert('Post deleted successfully');
                showPosts();
            } else {
                alert('Failed to delete post');
            }
        });
    }

    function likePost(postId) {
        fetchWithAuth(postsUrl + postId + '/like/', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(`Post liked successfully. Total likes: ${data.likes_count}`);
            showPosts();
        });
    }

    function sharePost(postId) {
        fetchWithAuth(postsUrl + postId + '/share/', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(`Post shared successfully. Total shares: ${data.shares_count}`);
            showPosts();
        });
    }

    function showCommentForm(postId) {
        contentDiv.innerHTML = `
            <h2>Comment on Post</h2>
            <form id="comment-form" class="form">
                <div class="form-group">
                    <label for="content">Comment:</label>
                    <textarea id="content" name="content" class="form-control"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Comment</button>
            </form>
        `;

        document.getElementById('comment-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const content = document.getElementById('content').value;
            addComment(postId, content);
        });
    }

    function addComment(postId, content) {
        fetchWithAuth(postsUrl + postId + '/comment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        })
        .then(response => response.json())
        .then(data => {
            alert('Comment added successfully');
            showPosts();
        });
    }

    function likeComment(commentId) {
        fetchWithAuth(commentsUrl + commentId + '/like/', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(`Comment liked successfully. Total likes: ${data.likes_count}`);
            showPosts();
        });
    }

    function showFollowForm() {
        contentDiv.innerHTML = `
            <h2>Follow a User</h2>
            <form id="follow-form" class="form">
                <div class="form-group">
                    <label for="user_id">User ID to follow:</label>
                    <input type="text" id="user_id" name="user_id" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Follow</button>
            </form>
            <h2>Unfollow a User</h2>
            <form id="unfollow-form" class="form">
                <div class="form-group">
                    <label for="unfollow_user_id">User ID to unfollow:</label>
                    <input type="text" id="unfollow_user_id" name="unfollow_user_id" class="form-control">
                </div>
                <button type="submit" class="btn btn-danger">Unfollow</button>
            </form>
        `;

        document.getElementById('follow-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const userId = document.getElementById('user_id').value;
            followUser(userId);
        });

        document.getElementById('unfollow-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const userId = document.getElementById('unfollow_user_id').value;
            unfollowUser(userId);
        });
    }

    function followUser(userId) {
        fetchWithAuth(followUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pk: userId })
        })
        .then(response => response.json())
        .then(data => {
            alert('User followed successfully');
        });
    }

    function unfollowUser(userId) {
        fetchWithAuth(followUrl + userId + '/', {
            method: 'DELETE'
        })
        .then(response => {
            if (response.status === 204) {
                alert('User unfollowed successfully');
            } else {
                alert('Failed to unfollow user');
            }
        });
    }

    function showMessages() {
        fetchWithAuth(messagesUrl)
            .then(response => response.json())
            .then(data => {
                let messagesHtml = '<h2>Messages</h2>';
                messagesHtml += '<button id="send-message" class="btn btn-success mb-3">Send Message</button>';
                messagesHtml += '<ul class="list-group">';
                data.forEach(message => {
                    messagesHtml += `
                        <li class="list-group-item">
                            <strong>${message.sender.username}</strong>: ${message.content}
                            <span class="badge badge-primary">${message.is_read ? 'Read' : 'Unread'}</span>
                        </li>
                    `;
                });
                messagesHtml += '</ul>';
                contentDiv.innerHTML = messagesHtml;

                document.getElementById('send-message').addEventListener('click', showSendMessageForm);
            });
    }

    function showSendMessageForm() {
        contentDiv.innerHTML = `
            <h2>Send Message</h2>
            <form id="send-message-form" class="form">
                <div class="form-group">
                    <label for="recipient_id">Recipient ID:</label>
                    <input type="text" id="recipient_id" name="recipient_id" class="form-control">
                </div>
                <div class="form-group">
                    <label for="content">Message:</label>
                    <textarea id="content" name="content" class="form-control"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Send</button>
            </form>
        `;

        document.getElementById('send-message-form').addEventListener('submit', function (event) {
            event.preventDefault();
            const recipientId = document.getElementById('recipient_id').value;
            const content = document.getElementById('content').value;
            sendMessage(recipientId, content);
        });
    }

    function sendMessage(recipientId, content) {
        fetchWithAuth(messagesUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipient_id: recipientId, content })
        })
        .then(response => response.json())
        .then(data => {
            alert('Message sent successfully');
            showMessages();
        });
    }

    loginLink.addEventListener('click', function (event) {
        event.preventDefault();
        showLoginForm();
    });

    registerLink.addEventListener('click', function (event) {
        event.preventDefault();
        showRegisterForm();
    });

    profileLink.addEventListener('click', function (event) {
        event.preventDefault();
        showProfile();
    });

    postsLink.addEventListener('click', function (event) {
        event.preventDefault();
        showPosts();
    });

    followLink.addEventListener('click', function (event) {
        event.preventDefault();
        showFollowForm();
    });

    messagesLink.addEventListener('click', function (event) {
        event.preventDefault();
        showMessages();
    });

    // Show login form by default
    showLoginForm();
});
