const API_BASE = "http://localhost:8080";
const CHECK_NICKNAME_API_URL = `${API_BASE}/api/auth/check-nickname`;
const UPDATE_PROFILE_API_URL = `${API_BASE}/api/users/me`;

const nicknameInput = document.getElementById("edit-nickname");
const emailText = document.getElementById("edit-email");
const errorText = document.getElementById("profile-edit-error");

const cancelButton = document.getElementById("profile-edit-cancel");
const saveButton = document.getElementById("profile-edit-save");

const logoLink = document.querySelector(".main-header__logo a");
const mypageButton = document.getElementById("mypage-button");
const dropdown = document.getElementById("mypage-dropdown");
const profileItem = document.getElementById("mypage-profile");
const logoutItem = document.getElementById("mypage-logout");

let isNicknameValid = false;
let nicknameAbortController = null;
let originalNickname = null;

function showMessage(element, message, color = "#d33") {
  if (!element) return;
  element.textContent = message;
  element.style.color = color;
  element.style.display = "block";
}

function hideMessage(element) {
  if (!element) return;
  element.textContent = "";
  element.style.display = "none";
}

function validateNicknamePattern(value) {
  const regex = /^[가-힣A-Za-z0-9_]+$/;
  return regex.test(value);
}

function includesWhitespace(value) {
  return /\s/.test(value);
}

async function isNicknameDuplicate(nickname, signal) {
  const url = CHECK_NICKNAME_API_URL + "?nickname=" + encodeURIComponent(nickname);
  const result = await apiClient.get(url, { signal });
  return result.data;
}

async function validateNicknameAndCheckDuplicate() {
  const value = nicknameInput.value.trim();

  if (value === "") {
    showMessage(errorText, "*닉네임을 입력해주세요.");
    nicknameInput.setAttribute("aria-invalid", "true");
    isNicknameValid = false;
    updateSaveButtonState();
    return;
  }

  if (includesWhitespace(value)) {
    showMessage(errorText, "*띄어쓰기를 없애주세요.");
    nicknameInput.setAttribute("aria-invalid", "true");
    isNicknameValid = false;
    updateSaveButtonState();
    return;
  }

  if (value.length > 10) {
    showMessage(errorText, "*닉네임은 최대 10자까지 작성 가능합니다.");
    nicknameInput.setAttribute("aria-invalid", "true");
    isNicknameValid = false;
    updateSaveButtonState();
    return;
  }

  if (!validateNicknamePattern(value)) {
    showMessage(errorText, "*닉네임은 한글/영문/숫자/밑줄(_)만 작성 가능합니다.");
    nicknameInput.setAttribute("aria-invalid", "true");
    isNicknameValid = false;
    updateSaveButtonState();
    return;
  }

  if (originalNickname && value === originalNickname) {
    hideMessage(errorText);
    nicknameInput.setAttribute("aria-invalid", "false");
    isNicknameValid = true;
    updateSaveButtonState();
    return;
  }

  if (nicknameAbortController) nicknameAbortController.abort();
  nicknameAbortController = new AbortController();

  showMessage(errorText, "닉네임 중복 확인 중...", "#666");

  try {
    const available = await isNicknameDuplicate(value, nicknameAbortController.signal);

    if (!available) {
      showMessage(errorText, "*중복된 닉네임입니다.");
      nicknameInput.setAttribute("aria-invalid", "true");
      isNicknameValid = false;
    } else {
      showMessage(errorText, "*사용 가능한 닉네임입니다.", "#2a8a2a");
      nicknameInput.setAttribute("aria-invalid", "false");
      isNicknameValid = true;
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    showMessage(errorText, "*중복 확인에 실패했습니다. 잠시 후 다시 시도해주세요.");
    nicknameInput.setAttribute("aria-invalid", "true");
    isNicknameValid = false;
  }

  updateSaveButtonState();
}

function updateSaveButtonState() {
  if (!saveButton) return;

  if (isNicknameValid) {
    saveButton.disabled = false;
    saveButton.style.opacity = "1";
    saveButton.style.cursor = "pointer";
  } else {
    saveButton.disabled = true;
    saveButton.style.opacity = "0.7";
    saveButton.style.cursor = "not-allowed";
  }
}

function setupHeader() {
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
    localStorage.removeItem("accessToken");
    location.href = "login.html";
  });

  document.addEventListener("click", (event) => {
    if (mypageButton.contains(event.target) || dropdown.contains(event.target)) return;
    dropdown.classList.remove("main-header__dropdown--open");
  });
}

async function loadProfile() {
  const result = await apiClient.get(`${API_BASE}/api/users/me`);
  return result.data;
}

function initProfileEdit(user) {
  originalNickname = user.nickname ?? "";
  if (nicknameInput) nicknameInput.value = originalNickname;
  if (emailText) emailText.textContent = user.email ?? "-";
  isNicknameValid = true;
  updateSaveButtonState();
}

async function handleSave() {
  const nickname = nicknameInput.value.trim();

  if (!isNicknameValid) {
    showMessage(errorText, "*닉네임을 다시 확인해주세요.");
    return;
  }

  try {
    await apiClient.patch(UPDATE_PROFILE_API_URL, { nickname });

    alert("닉네임이 수정되었습니다.");
    location.href = "mypage.html";
  } catch {
    showMessage(errorText, "*닉네임 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }
}

function handleCancel() {
  location.href = "mypage.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    location.href = "login.html";
    return;
  }

  setupHeader();

  try {
    const user = await loadProfile();
    initProfileEdit(user);
  } catch {
    alert("프로필 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
    location.href = "login.html";
    return;
  }

  nicknameInput?.addEventListener("blur", validateNicknameAndCheckDuplicate);
  nicknameInput?.addEventListener("input", () => {
    hideMessage(errorText);
    isNicknameValid = false;
    updateSaveButtonState();
  });

  cancelButton?.addEventListener("click", handleCancel);
  saveButton?.addEventListener("click", handleSave);
});
