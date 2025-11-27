const API_BASE = "http://localhost:8080";
const API_CHALLENGES = `${API_BASE}/api/challenges`;
const API_POSTS_BY_PARTICIPATION = (participationId) =>
  `${API_BASE}/api/participations/${participationId}/posts`;

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
  const participationIdParam = params.get("participationId");

  return {
    challengeId: challengeIdParam ? Number(challengeIdParam) : null,
    participationId: participationIdParam ? Number(participationIdParam) : null,
  };
}

async function fetchChallengeDetail(challengeId) {
  const response = await fetch(`${API_CHALLENGES}/${challengeId}`);

  if (!response.ok) {
    throw new Error(`챌린지 상세 조회 실패: status ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

async function renderChallengeName(challengeId) {
  const nameEl = document.getElementById("post-write-challenge-name");
  if (!nameEl || !challengeId) return;

  try {
    const detail = await fetchChallengeDetail(challengeId);
    nameEl.textContent = detail.title ?? "챌린지";
  } catch (e) {
    console.error(e);
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
  const { participationId, challengeId } = params;

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

    if (!participationId) {
      showGlobalError("참여 정보가 없습니다. 다시 시도해 주세요.");
      return;
    }


    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "작성 중...";

    try {
      const response = await fetch(API_POSTS_BY_PARTICIPATION(participationId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          imageUrl: null,
        }),
      });

      if (!response.ok) {
        throw new Error(`작성 실패: status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "작성에 실패했습니다.");
      }

      if (challengeId) {
        location.href = `challenge-detail.html?challengeId=${challengeId}`;
      } else {
        location.href = "main.html";
      }
    } catch (e) {
      console.error(e);
      showGlobalError("Up-Date 작성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    location.href = "login.html";
    return;
  }

  const params = getWriteParams();
  const { challengeId, participationId } = params;

  if (!participationId) {
    alert("참여 정보가 없습니다. 챌린지 상세 페이지에서 다시 시도해 주세요.");
    history.back();
    return;
  }

  setupHeader();
  setupBackButton(challengeId);
  initCancelButton(challengeId);
  initContentTextarea();

  if (challengeId) {
    await renderChallengeName(challengeId);
  }

  initSubmitHandler(params);
});
