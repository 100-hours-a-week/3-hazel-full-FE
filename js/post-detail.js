const API_BASE = "http://localhost:8080";
const API_POSTS = `${API_BASE}/api/posts`;

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

function getDetailParams() {
  const params = new URLSearchParams(window.location.search);

  const postIdParam = params.get("postId");
  const challengeIdParam = params.get("challengeId");

  return {
    postId: postIdParam ? Number(postIdParam) : null,
    challengeIdFromUrl: challengeIdParam ? Number(challengeIdParam) : null,
  };
}

function formatPostDate(dateStr) {
  if (!dateStr) return "";

  const [datePart] = dateStr.split("T");
  if (!datePart) return dateStr;

  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return dateStr;

  const shortYear = y.slice(2);
  return `${shortYear}-${m}-${d}`;
}

async function fetchPostDetail(postId) {
  const result = await apiClient.get(`${API_POSTS}/${postId}`);
  return result.data;
}

function renderPostContent(post) {
  const contentEl = document.getElementById("post-detail-content");
  const metaEl = document.getElementById("post-detail-meta");
  const imageWrapper = document.getElementById("post-detail-image-wrapper");
  const imageEl = document.getElementById("post-detail-image");

  if (!contentEl || !metaEl) return;

  contentEl.textContent = post.content ?? "";

  const nickname = post.writerNickname ?? "사용자";
  const dateText = formatPostDate(post.createdAt);
  const views = post.viewCount ?? 0;

  metaEl.textContent = `작성자 ${nickname} · ${dateText} · 조회수 ${views}`;

  if (post.imageUrl) {
    if (imageWrapper && imageEl) {
      imageEl.src = post.imageUrl;
      imageWrapper.style.display = "block";
    }
  } else if (imageWrapper) {
    imageWrapper.style.display = "none";
  }
}

function renderChallengeTitleFromPost(post) {
  const titleEl = document.getElementById("post-detail-challenge-name");
  if (!titleEl) return;

  titleEl.textContent = post.challengeTitle ?? "챌린지";
}

function setupBackToChallengeButton(challengeId) {
  const backBtn = document.getElementById("post-detail-back");
  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    if (challengeId) {
      location.href = `challenge-detail.html?challengeId=${challengeId}`;
    } else {
      history.back();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    location.href = "login.html";
    return;
  }

  const { postId, challengeIdFromUrl } = getDetailParams();

  if (!postId) {
    alert("Up-Date 정보가 없습니다. 목록 페이지에서 다시 시도해 주세요.");
    history.back();
    return;
  }

  setupHeader();

  let finalChallengeId = challengeIdFromUrl ?? null;

  try {
    const post = await fetchPostDetail(postId);

    renderPostContent(post);
    renderChallengeTitleFromPost(post);

    setupBackButton(finalChallengeId);
    setupBackToChallengeButton(finalChallengeId);
  } catch (e) {
    console.error(e);
    alert("Up-Date 상세 정보를 불러오는 데 실패했습니다.");
    history.back();
  }
});
