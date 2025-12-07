const API_BASE = "http://localhost:8080";
const API_CHALLENGES = `${API_BASE}/api/challenges`;

function getApplyParams() {
    const params = new URLSearchParams(window.location.search);

    const challengeId = params.get("challengeId");
    const joinedParam = params.get("joined");
    const participantCountParam = params.get("participantCount");

    return {
        challengeId: challengeId ? Number(challengeId) : null,
        joined: joinedParam === "true",
        participantCount: participantCountParam ? Number(participantCountParam) : 0,
    };
}

function mapCategoryToKorean(category) {
    switch (category) {
        case "STUDY": return "공부";ㄴ
        case "HEALTH": return "운동";
        case "READING": return "독서";
        case "LIFE": return "생활습관";
        case "ETC": return "기타";
        default: return category ?? "";
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


async function fetchChallengeDetail(challengeId) {
    const result = await apiClient.get(`${API_CHALLENGES}/${challengeId}/preview`);
    return result.data;
}

function renderChallengeDetail(detail, extra) {
    const categoryEl = document.getElementById("challenge-category");
    const titleEl = document.getElementById("challenge-title");
    const dueEl = document.getElementById("challenge-due");
    const participantsEl = document.getElementById("challenge-participants");
    const descEl = document.getElementById("challenge-description");

    categoryEl.textContent = `#${mapCategoryToKorean(detail.category)}`;
    titleEl.textContent = detail.title;

    const endDate = detail.endDate ?? detail.dueDate ?? null;
    dueEl.textContent = formatDueDate(endDate);

    const count = extra?.participantCount ?? detail.participantCount ?? 0;
    participantsEl.textContent = `총 ${count}명 참여 중`;

    descEl.textContent = detail.description ?? "";
}


function setupActionButton(challengeId, initialJoined, initialParticipantCount) {
    const button = document.getElementById("challenge-action-button");
    const participantsEl = document.getElementById("challenge-participants");
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!button) return;

    let joined = initialJoined;
    let participantCount = initialParticipantCount ?? 0;

    function renderButton() {
        if (joined) {
            button.textContent = "참여중";
            button.classList.add("challenge-apply__button--joined");
        } else {
            button.textContent = "참여하기";
            button.classList.remove("challenge-apply__button--joined");
        }

        participantsEl.textContent = `총 ${participantCount}명 참여 중`;
    }

    renderButton();

    button.addEventListener("click", async () => {
        if (!currentUser) {
            location.href = "login.html";
            return;
        }

        if (joined) {
            location.href = `challenge-detail.html?challengeId=${challengeId}`;
            return;
        }

        try {
            await apiClient.post(`${API_CHALLENGES}/${challengeId}/participations`);

            joined = true;
            participantCount += 1;
            renderButton();
        } catch (e) {
            console.error(e);
            alert("챌린지 참여 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    });
}

function setupCloseButton() {
    const closeButton = document.getElementById("apply-close-button");
    if (!closeButton) return;

    closeButton.addEventListener("click", () => {
        if (window.history.length > 1) {
            history.back();
        } else {
            location.href = "challenge-list.html";
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const { challengeId, joined, participantCount } = getApplyParams();

    if (!challengeId) {
        console.error("URL에 challengeId가 없습니다.");
        location.href = "challenge-list.html";
        return;
    }

    setupCloseButton();

    try {
        const detail = await fetchChallengeDetail(challengeId);
        renderChallengeDetail(detail, { participantCount });

        setupActionButton(challengeId, joined, participantCount);
    } catch (e) {
        console.error(e);
        alert("챌린지 정보를 불러오는 데 실패했습니다.");
    }
});
