const API_BASE = "http://localhost:8080";
const API_USERS = `${API_BASE}/api/users`;
const API_CHALLENGES = `${API_BASE}/api/challenges`;

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

function updateTopBanner(challenges) {
    const bannerTitle = document.getElementById("banner-title");
    const bannerSubtitle = document.getElementById("banner-subtitle");
    const bannerAction = document.getElementById("banner-action");

    if (!bannerTitle || !bannerSubtitle || !bannerAction) return;

    if (!challenges || challenges.length === 0) {
        bannerTitle.textContent = "아직 참여 중인 챌린지가 없어요.";
        bannerSubtitle.textContent = "어떤 챌린지가 있는지 살펴보러 갈까요?";
        bannerAction.onclick = () => {
            location.href = "challenge-list.html";
        };
        return;
    }

    const notPostedToday = challenges.filter((c) => !c.todayUpdated);
    const section = document.getElementById("my-challenges-section");

    if (notPostedToday.length > 0) {
        bannerTitle.textContent = "오늘의 Up-Date를 공유해주세요!";
        bannerSubtitle.textContent = "아직 오늘의 인증을 작성하지 않은 챌린지가 있어요.";
        bannerAction.onclick = () => {
            if (section) {
                section.scrollIntoView({ behavior: "smooth" });
            }
        };
        return;
    }

    bannerTitle.textContent = "오늘의 Up-Date를 모두 완료했어요!";
    bannerSubtitle.textContent = "다른 사람들의 Up-Date를 보러 갈까요?";
    bannerAction.onclick = () => {
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };
}

async function fetchMyChallenges() {
    const result = await apiClient.get(`${API_USERS}/me/challenges`);
    return result.data || [];
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
    if (!dueDate) {
        return "마감일: 기한 없음";
    }

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) {
        return "마감일: 기한 없음";
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `마감일: ${y}.${m}.${d}`;
}

function createMyChallengeCard(challenge) {
    const li = document.createElement("li");
    li.className = "challenge-card";

    const left = document.createElement("div");
    left.className = "challenge-card__left";

    const categoryEl = document.createElement("div");
    categoryEl.className = "challenge-card__category";
    categoryEl.textContent = `#${mapCategoryToKorean(challenge.category)}`;
    left.appendChild(categoryEl);

    const titleEl = document.createElement("div");
    titleEl.className = "challenge-card__title";
    titleEl.textContent = challenge.title;
    left.appendChild(titleEl);

    const metaEl = document.createElement("div");
    metaEl.className = "challenge-card__meta";
    const endDate = challenge.endDate ?? challenge.dueDate ?? null;
    metaEl.textContent = formatDueDate(endDate);
    left.appendChild(metaEl);

    li.appendChild(left);

    const right = document.createElement("div");
    right.className = "challenge-card__right";

    const statusEl = document.createElement("span");
    statusEl.className = "challenge-card__action";
    statusEl.textContent = challenge.todayUpdated
        ? "Up-Date 작성 완료"
        : "Up-Date 작성하기";

    if (challenge.todayUpdated) {
        statusEl.classList.add("challenge-card__action--done");
    }

    right.appendChild(statusEl);
    li.appendChild(right);

    li.addEventListener("click", () => {
        const params = new URLSearchParams({
            challengeId: String(challenge.challengeId ?? challenge.id),
        });

        location.href = `challenge-detail.html?${params.toString()}`;
    });


    return li;
}

function renderMyChallenges(challenges) {
    const challengeList = document.getElementById("my-challenges-list");
    const challengeEmpty = document.getElementById("my-challenges-empty");

    if (!challengeList || !challengeEmpty) return;

    if (!challenges || challenges.length === 0) {
        challengeEmpty.style.display = "block";
        challengeList.style.display = "none";
        challengeList.innerHTML = "";
        return;
    }

    challengeEmpty.style.display = "none";
    challengeList.style.display = "block";
    challengeList.innerHTML = "";

    challenges.forEach((challenge) => {
        const li = createMyChallengeCard(challenge);
        challengeList.appendChild(li);
    });
}

async function fetchRecommendedChallenges() {
    const RECOMMENDED_LIMIT = 4;
    const result = await apiClient.get(
        `${API_CHALLENGES}/recommended?size=${RECOMMENDED_LIMIT}`
    );
    return result.data || [];
}

function createRecommendedChallengeCard(challenge) {
    const li = document.createElement("li");
    li.className = "challenge-card challenge-card--recommended";

    const left = document.createElement("div");
    left.className = "challenge-card__left";

    const categoryEl = document.createElement("div");
    categoryEl.className = "challenge-card__category";
    categoryEl.textContent = `#${mapCategoryToKorean(challenge.category)}`;
    left.appendChild(categoryEl);

    const titleEl = document.createElement("div");
    titleEl.className = "challenge-card__title";
    titleEl.textContent = challenge.title;
    left.appendChild(titleEl);

    const metaEl = document.createElement("div");
    metaEl.className = "challenge-card__meta";
    const endDate = challenge.endDate ?? challenge.dueDate ?? null;
    metaEl.textContent = formatDueDate(endDate);
    left.appendChild(metaEl);

    li.appendChild(left);

    li.addEventListener("click", () => {
        const params = new URLSearchParams({
            challengeId: String(challenge.id),
            joined: String(challenge.joined ?? false),
            participantCount: String(challenge.participantCount ?? 0),
        });

        location.href = `challenge-apply.html?${params.toString()}`;
    });

    return li;
}


function renderRecommendedChallenges(challenges) {
    const challengeList = document.getElementById("recommended-list");
    const challengeEmpty = document.getElementById("recommended-empty");
    const viewAllBtn = document.getElementById("recommended-view-all");

    if (!challengeList || !challengeEmpty || !viewAllBtn) return;

    viewAllBtn.onclick = () => {
        location.href = "challenge-list.html";
    };

    if (!challenges || challenges.length === 0) {
        challengeEmpty.style.display = "block";
        challengeList.style.display = "none";
        challengeList.innerHTML = "";
        return;
    }

    challengeEmpty.style.display = "none";
    challengeList.style.display = "block";
    challengeList.innerHTML = "";

    challenges.forEach((challenge) => {
        const li = createRecommendedChallengeCard(challenge);
        challengeList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        location.href = "login.html";
        return;
    }

    setupHeader();

    try {
        const myChallenges = await fetchMyChallenges();
        updateTopBanner(myChallenges);
        renderMyChallenges(myChallenges);

        const recommendedChallenges = await fetchRecommendedChallenges();
        renderRecommendedChallenges(recommendedChallenges);
    } catch (e) {
        console.error(e);
        alert("메인 화면 정보를 불러오는 데 실패했습니다.");
    }
});
