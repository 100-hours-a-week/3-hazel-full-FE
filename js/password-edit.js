const API_BASE_URL = "http://localhost:8080";

const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const newPasswordConfirmInput = document.getElementById("new-password-confirm");

const currentPasswordError = document.getElementById("current-password-error");
const newPasswordError = document.getElementById("new-password-error");
const newPasswordConfirmError = document.getElementById("new-password-confirm-error");
const globalError = document.getElementById("password-edit-global-error");

const cancelButton = document.getElementById("password-edit-cancel");
const saveButton = document.getElementById("password-edit-save");

const logoLink = document.querySelector(".main-header__logo a");
const mypageButton = document.getElementById("mypage-button");
const dropdown = document.getElementById("mypage-dropdown");
const profileItem = document.getElementById("mypage-profile");
const logoutItem = document.getElementById("mypage-logout");

let isCurrentPasswordValid = false;
let isNewPasswordValid = false;
let isNewPasswordConfirmValid = false;

function showMessage(element, message, color = "#c62828") {
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

function validatePassword(value) {
  if (value.length < 8 || value.length > 20) return false;

  const upper = /[A-Z]/;
  const lower = /[a-z]/;
  const number = /[0-9]/;
  const special = /[!@#$%^&*]/;

  return (
    upper.test(value) &&
    lower.test(value) &&
    number.test(value) &&
    special.test(value)
  );
}

function validateCurrentPassword() {
  const value = currentPasswordInput.value.trim();

  if (value === "") {
    showMessage(currentPasswordError, "*현재 비밀번호를 입력해주세요.");
    currentPasswordInput.setAttribute("aria-invalid", "true");
    isCurrentPasswordValid = false;
  } else {
    hideMessage(currentPasswordError);
    currentPasswordInput.setAttribute("aria-invalid", "false");
    isCurrentPasswordValid = true;
  }

  updateSaveButtonState();
}

function validateNewPassword() {
  const value = newPasswordInput.value.trim();
  const current = currentPasswordInput.value.trim();

  if (value === "") {
    showMessage(newPasswordError, "*새 비밀번호를 입력해주세요.");
    newPasswordInput.setAttribute("aria-invalid", "true");
    isNewPasswordValid = false;
    updateSaveButtonState();
    return;
  }

  if (!validatePassword(value)) {
    showMessage(
      newPasswordError,
      "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
    );
    newPasswordInput.setAttribute("aria-invalid", "true");
    isNewPasswordValid = false;
    updateSaveButtonState();
    return;
  }

  if (current && value === current) {
    showMessage(newPasswordError, "*현재 비밀번호와 다른 비밀번호를 사용해주세요.");
    newPasswordInput.setAttribute("aria-invalid", "true");
    isNewPasswordValid = false;
    updateSaveButtonState();
    return;
  }

  hideMessage(newPasswordError);
  newPasswordInput.setAttribute("aria-invalid", "false");
  isNewPasswordValid = true;

  validateNewPasswordConfirm();
  updateSaveButtonState();
}

function validateNewPasswordConfirm() {
  const password = newPasswordInput.value.trim();
  const confirm = newPasswordConfirmInput.value.trim();

  if (confirm === "") {
    showMessage(newPasswordConfirmError, "*새 비밀번호를 한 번 더 입력해주세요.");
    newPasswordConfirmInput.setAttribute("aria-invalid", "true");
    isNewPasswordConfirmValid = false;
    updateSaveButtonState();
    return;
  }

  if (password !== confirm) {
    showMessage(newPasswordConfirmError, "*비밀번호가 일치하지 않습니다.");
    newPasswordConfirmInput.setAttribute("aria-invalid", "true");
    isNewPasswordConfirmValid = false;
    updateSaveButtonState();
    return;
  }

  hideMessage(newPasswordConfirmError);
  newPasswordConfirmInput.setAttribute("aria-invalid", "false");
  isNewPasswordConfirmValid = true;
  updateSaveButtonState();
}

function updateSaveButtonState() {
  if (!saveButton) return;

  const enabled =
    isCurrentPasswordValid && isNewPasswordValid && isNewPasswordConfirmValid;

  saveButton.disabled = !enabled;
  saveButton.style.opacity = enabled ? "1" : "0.7";
  saveButton.style.cursor = enabled ? "pointer" : "not-allowed";
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

async function handleSave(currentUser) {
  if (!currentUser) return;

  validateCurrentPassword();
  validateNewPassword();
  validateNewPasswordConfirm();

  if (!(isCurrentPasswordValid && isNewPasswordValid && isNewPasswordConfirmValid)) {
    showMessage(globalError, "입력한 정보를 다시 확인해주세요.");
    return;
  }

  hideMessage(globalError);

  const payload = {
    currentPassword: currentPasswordInput.value,
    newPassword: newPasswordInput.value,
  };

  try {
    alert("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
    localStorage.removeItem("currentUser");
    location.href = "login.html";
  } catch (err) {
    console.error(err);
    showMessage(
      globalError,
      "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요."
    );
  }
}

function handleCancel() {
  location.href = "mypage.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    location.href = "login.html";
    return;
  }

  setupHeader();

  if (currentPasswordInput) {
    currentPasswordInput.addEventListener("blur", validateCurrentPassword);
    currentPasswordInput.addEventListener("input", () => {
      hideMessage(currentPasswordError);
      hideMessage(globalError);
      isCurrentPasswordValid = false;
      updateSaveButtonState();
    });
  }

  if (newPasswordInput) {
    newPasswordInput.addEventListener("blur", validateNewPassword);
    newPasswordInput.addEventListener("input", () => {
      hideMessage(newPasswordError);
      hideMessage(globalError);
      isNewPasswordValid = false;
      updateSaveButtonState();
    });
  }

  if (newPasswordConfirmInput) {
    newPasswordConfirmInput.addEventListener("blur", validateNewPasswordConfirm);
    newPasswordConfirmInput.addEventListener("input", () => {
      hideMessage(newPasswordConfirmError);
      hideMessage(globalError);
      isNewPasswordConfirmValid = false;
      updateSaveButtonState();
    });
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", handleCancel);
  }

  if (saveButton) {
    saveButton.addEventListener("click", () => handleSave(currentUser));
  }

  updateSaveButtonState();
});
