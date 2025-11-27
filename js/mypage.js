const API_BASE = "http://localhost:8080";

function setupHeader() {
    const logoLink = document.querySelector(".main-header__logo a");
    const mypageButton = document.getElementById("mypage-button");
    const dropdown = document.getElementById("mypage-dropdown");
    const profileItem = document.getElementById("mypage-profile");
    const logoutItem = document.getElementById("mypage-logout");

    if (!logoLink || !mypageButton || !dropdown) return;

    logoLink.addEventListener("click", (event) => {
        event.preventDefault();
        location.href = "main.html";
    });

    mypageButton.addEventListener("click", () => {
        dropdown.classList.toggle("main-header__dropdown--open");
    });

    profileItem?.addEventListener("click", () => {
        location.href = "mypage.html";
    });

    logoutItem?.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        location.href = "login.html";
    });

    document.addEventListener("click", (event) => {
        if (
            mypageButton.contains(event.target) ||
            dropdown.contains(event.target)
        ) {
            return;
        }
        dropdown.classList.remove("main-header__dropdown--open");
    });
}

function renderProfile(currentUser) {
    const nicknameEl = document.getElementById("profile-nickname");
    const emailEl = document.getElementById("profile-email");

    if (!nicknameEl || !emailEl) return;

    nicknameEl.textContent = currentUser?.nickname ?? "-";
    emailEl.textContent = currentUser?.email ?? "-";
}

function setupActionButtons() {
    const editProfileBtn = document.getElementById("btn-edit-profile");
    const editPasswordBtn = document.getElementById("btn-edit-password");

    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {
            location.href = "profile-edit.html";
        });
    }

    if (editPasswordBtn) {
        editPasswordBtn.addEventListener("click", () => {
            location.href = "password-edit.html";
        });
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        location.href = "login.html";
        return;
    }

    setupHeader();
    renderProfile(currentUser);
    setupActionButtons();
});
