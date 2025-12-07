const API_BASE = "http://localhost:8080";
const API_CHALLENGES = `${API_BASE}/api/challenges`;

function setupBackButton(challengeId) {
  const backButton = document.getElementById("challenge-back-button");
  if (!backButton) return;

  backButton.addEventListener("click", () => {
    if (challengeId) {
      location.href = `challenge-detail.html?challengeId=${challengeId}`;
    } else {
      history.back();
    }
  });
}

function setupHeader() {
  const logoLink = document.querySelector(".main-header__logo a");
  const mypageButton = document.querySelector(".main-header__mypage");
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

function getWriteParams() {
  const params = new URLSearchParams(window.location.search);

  const challengeIdParam = params.get("challengeId");

  return {
    challengeId: challengeIdParam ? Number(challengeIdParam) : null
  };
}

async function fetchChallengeDetail(challengeId) {
  const result = await apiClient.get(`${API_CHALLENGES}/${challengeId}`);
  return result.data;
}

async function renderChallengeName(challengeId) {
  const nameEl = document.getElementById("post-write-challenge-name");
  if (!nameEl || !challengeId) return;

  try {
    const detail = await fetchChallengeDetail(challengeId);
    nameEl.textContent = detail.title ?? "챌린지";
  } catch {
    nameEl.textContent = "챌린지 정보를 불러오지 못했습니다.";
  }
}

function initContentTextarea() {
  const textarea = document.getElementById("post-content");
  const lengthSpan = document.getElementById("post-content-length");
  const errorEl = document.getElementById("post-write-error");
  const submitButton = document.getElementById("post-write-submit");

  if (!textarea || !lengthSpan || !submitButton) return;

  const MAX_LENGTH = 1000;
  const MIN_LENGTH = 10;

  const updateState = () => {
    const value = textarea.value ?? "";

    if (value.length > MAX_LENGTH) {
      textarea.value = value.slice(0, MAX_LENGTH);
    }

    const len = textarea.value.length;
    lengthSpan.textContent = String(len);

    const isValid = len >= MIN_LENGTH;
    submitButton.disabled = !isValid;
    errorEl.style.display = "none";
  };

  textarea.addEventListener("input", updateState);
  updateState();
}

function showValidationError(message) {
  const errorEl = document.getElementById("post-write-error");
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.style.display = "block";
}

function showGlobalError(message) {
  alert(message);
}

function initCancelButton(challengeId) {
  const cancelButton = document.getElementById("post-write-cancel");
  if (!cancelButton) return;

  cancelButton.addEventListener("click", () => {
    if (challengeId) {
      location.href = `challenge-detail.html?challengeId=${challengeId}`;
    } else {
      history.back();
    }
  });
}

function initSubmitHandler(params) {
  const { challengeId } = params;

  const textarea = document.getElementById("post-content");
  const submitButton = document.getElementById("post-write-submit");
  if (!textarea || !submitButton) return;

  const MIN_LENGTH = 10;

  submitButton.addEventListener("click", async () => {
    const content = (textarea.value ?? "").trim();

    if (content.length < MIN_LENGTH) {
      showValidationError("내용을 최소 10자 이상 입력해 주세요.");
      return;
    }

    if (!challengeId) {
      showGlobalError("챌린지 정보가 없습니다. 다시 시도해 주세요.");
      return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "작성 중...";

    try {
      await apiClient.post(`${API_CHALLENGES}/${challengeId}/posts`, {
        content,
        imageUrl: null
      });

      location.href = `challenge-detail.html?challengeId=${challengeId}`;
    } catch {
      showGlobalError(
        "Up-Date 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    location.href = "login.html";
    return;
  }

  const params = getWriteParams();
  const { challengeId } = params;

  if (!challengeId) {
    alert("챌린지 정보가 없습니다. 챌린지 상세 페이지에서 다시 시도해 주세요.");
    history.back();
    return;
  }

  setupHeader();
  setupBackButton(challengeId);
  initCancelButton(challengeId);
  initContentTextarea();

  await renderChallengeName(challengeId);

  initSubmitHandler(params);
});
