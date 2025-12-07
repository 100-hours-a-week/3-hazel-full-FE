const API_BASE = "http://localhost:8080";
const API_CHALLENGES = `${API_BASE}/api/challenges`;
const API_USERS = `${API_BASE}/api/users`;

function setupBackButton() {
    const backButton = document.getElementById("challenge-back-button");
    if (!backButton) return;

    backButton.addEventListener("click", () => {
        history.back();
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

    const challengeId = params.get("challengeId");
    const participantCountParam = params.get("participantCount");

    return {
        challengeId: challengeId ? Number(challengeId) : null,
        participantCount: participantCountParam ? Number(participantCountParam) : 0,
    };
}

function mapCategoryToKorean(category) {
    switch (category) {
        case "STUDY":
            return "공부";
        case "HEALTH":
            return "운동";
        case "READING":
            return "독서";
        case "LIFE":
            return "생활습관";
        case "ETC":
            return "기타";
        default:
            return category ?? "";
    }
}

function formatDueDate(dueDate) {
    if (!dueDate) return "마감일: 기한 없음";

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) return "마감일: 기한 없음";

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `마감일: ${y}.${m}.${d}`;
}

function formatPostDate(dateStr) {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";

    const y = String(date.getFullYear()).slice(2);
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
}

async function fetchChallengeDetail(challengeId) {
    const result = await apiClient.get(`${API_CHALLENGES}/${challengeId}`);
    return result.data;
}

async function fetchPostsByChallenge(challengeId) {
    const result = await apiClient.get(`${API_CHALLENGES}/${challengeId}/posts`);
    return result.data ?? [];
}

async function fetchMyPosts(challengeId) {
    const result = await apiClient.get(
        `${API_USERS}/me/challenges/${challengeId}/posts`
    );
    return result.data ?? [];
}

async function fetchMyParticipationId(challengeId) {
    const result = await apiClient.get(`${API_USERS}/me/challenges`);
    const list = result.data || [];
    const found = list.find((ch) => ch.challengeId === challengeId);
    return found ? found.participationId : null;
}

function createPostCard(post) {
    const li = document.createElement("li");
    li.className = "post-card";

    const left = document.createElement("div");
    left.className = "post-card__left";

    const nicknameEl = document.createElement("div");
    nicknameEl.className = "post-card__nickname";
    nicknameEl.textContent = post.writerNickname ?? "사용자";

    const snippetEl = document.createElement("div");
    snippetEl.className = "post-card__snippet";

    const content = post.content ?? "";
    const maxLength = 30;
    snippetEl.textContent =
        content.length > maxLength ? content.slice(0, maxLength) + "..." : content;

    left.appendChild(nicknameEl);
    left.appendChild(snippetEl);

    const right = document.createElement("div");
    right.className = "post-card__date";
    right.textContent = formatPostDate(post.createdAt);

    li.appendChild(left);
    li.appendChild(right);

    li.addEventListener("click", () => {
        location.href = `post-detail.html?postId=${post.id}`;
    });

    return li;
}

function renderMyPosts(myPosts) {
    const listEl = document.getElementById("my-posts-list");
    const emptyEl = document.getElementById("my-posts-empty");

    if (!listEl || !emptyEl) return;

    if (!myPosts || myPosts.length === 0) {
        emptyEl.style.display = "block";
        listEl.style.display = "none";
        listEl.innerHTML = "";
        return;
    }

    emptyEl.style.display = "none";
    listEl.style.display = "block";
    listEl.innerHTML = "";

    myPosts.forEach((post) => {
        const li = createPostCard(post);
        listEl.appendChild(li);
    });
}

function renderAllPosts(allPosts) {
    const listEl = document.getElementById("all-posts-list");
    const emptyEl = document.getElementById("all-posts-empty");

    if (!listEl || !emptyEl) return;

    if (!allPosts || allPosts.length === 0) {
        emptyEl.style.display = "block";
        listEl.style.display = "none";
        listEl.innerHTML = "";
        return;
    }

    emptyEl.style.display = "none";
    listEl.style.display = "block";
    listEl.innerHTML = "";

    allPosts.forEach((post) => {
        const li = createPostCard(post);
        listEl.appendChild(li);
    });
}

function setupWriteButton(challengeId) {
    const writeButton = document.getElementById("my-posts-write-button");
    if (!writeButton) return;

    writeButton.addEventListener("click", async () => {
        try {
            const participationId = await fetchMyParticipationId(challengeId);

            if (!participationId) {
                alert("이 챌린지에 대한 참여 정보가 없습니다. 먼저 참가를 완료해 주세요.");
                return;
            }

            const params = new URLSearchParams({
                challengeId: String(challengeId),
                participationId: String(participationId),
            });

            location.href = `post-write.html?${params.toString()}`;
        } catch (e) {
            console.error(e);
            alert("작성 페이지로 이동하는 데 실패했습니다.");
        }
    });
}

function renderChallengeHero(detail, extra) {
    const categoryEl = document.getElementById("challenge-category");
    const titleEl = document.getElementById("challenge-title");
    const dueEl = document.getElementById("challenge-due");
    const participantsEl = document.getElementById("challenge-participants");
    const descEl = document.getElementById("challenge-description");

    if (!categoryEl || !titleEl || !dueEl || !participantsEl || !descEl) return;

    categoryEl.textContent = `#${mapCategoryToKorean(detail.category)}`;
    titleEl.textContent = detail.title;
    dueEl.textContent = formatDueDate(detail.endDate ?? detail.dueDate ?? null);

    const count =
        detail.participantCount ??
        extra?.participantCount ??
        0;
    participantsEl.textContent = `총 ${count}명 참여 중`;

    descEl.textContent = detail.description ?? "";
}

document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        location.href = "login.html";
        return;
    }

    const { challengeId, participantCount } = getDetailParams();

    if (!challengeId) {
        location.href = "challenge-list.html";
        return;
    }

    setupBackButton();
    setupHeader();

    try {
        const detail = await fetchChallengeDetail(challengeId);
        renderChallengeHero(detail, { participantCount });

        const allPosts = await fetchPostsByChallenge(challengeId);
        renderAllPosts(allPosts);

        const myPosts = await fetchMyPosts(challengeId);
        renderMyPosts(myPosts);

        setupWriteButton(challengeId);
    } catch (e) {
        console.error(e);
        alert("챌린지 정보를 불러오는 데 실패했습니다.");
    }
});
