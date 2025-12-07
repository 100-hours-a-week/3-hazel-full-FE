const API_BASE = "http://localhost:8080";
const API_USERS_ME = `${API_BASE}/api/users/me`;

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
        localStorage.removeItem("accessToken");
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

async function loadCurrentUserFromServer() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        location.href = "login.html";
        return null;
    }

    const res = await apiClient.get(API_USERS_ME);
    const profile = res.data;

    localStorage.setItem("currentUser", JSON.stringify(profile));
    return profile;
}

document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = await loadCurrentUserFromServer();
    if (!currentUser) {
        return;
    }

    setupHeader();
    renderProfile(currentUser);
    setupActionButtons();
});
