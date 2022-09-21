const names = [
  "강아지",
  "개",
  "검은담비",
  "고라니",
  "고래",
  "고리무늬물범",
  "고릴라",
  "고슴도치",
  "고양이",
  "곰",
  "괴",
  "기니피그",
  "기린",
  "나귀",
  "나무늘보",
  "낙타",
  "너구리",
  "노루",
  "노새",
  "뉴트리아",
  "늑대",
  "능소니",
  "다람쥐",
  "단봉낙타",
  "담비",
  "당나귀",
  "돌고래",
  "돼지",
  "두더지",
  "들고양이",
  "라마",
  "락타",
  "마르모트",
  "말",
  "망아지",
  "매머드",
  "맥",
  "멧돼지",
  "몰티즈",
  "물개",
  "미국너구리",
  "미어캣",
  "바다코끼리",
  "바다표범",
  "버새",
  "바위담비",
  "북극곰",
  "박쥐",
  "불도그",
  "반달곰",
  "비버",
  "백두산호랑이",
  "사냥개",
  "범고래",
  "사이가",
  "북극여우",
  "사자",
  "불여우",
  "살쾡이",
  "빈양",
  "삽살개",
  "사슴",
  "서벌",
  "사이가산양",
  "셰퍼드",
  "산토끼",
  "송아지",
  "삵",
  "수달",
  "생쥐",
  "순록",
  "성우",
  "스컹크",
  "소",
  "승냥이",
  "수고양이",
  "시베리아호랑이",
  "수사슴",
  "아르마딜로",
  "스라소니",
  "아무르표범",
  "스피츠",
  "안경곰",
  "시궁쥐",
  "알파카",
  "쌍봉낙타",
  "암사슴",
  "아메리카들소",
  "야마",
  "아시아코끼리",
  "얼룩말",
  "안주애기박쥐",
  "여우",
  "암곰",
  "영양",
  "앙고라",
  "오소리",
  "양",
  "워터벅",
  "얼룩소",
  "웜뱃",
  "염소",
  "이리",
  "오리너구리",
  "일각고래",
  "요크셔테리어",
  "재규어",
  "원숭이",
  "진돗개",
  "유럽소나무담비",
  "차우차우",
  "인도상",
  "청서",
  "자칼",
  "초서",
  "쥐",
  "치타",
  "집쥐",
  "침팬지",
  "천산갑",
  "코끼리",
  "청설모",
  "코알라",
  "치와와",
  "토황마",
  "친칠라",
  "표범",
  "캥거루",
  "풍산개",
  "코뿔소",
  "하마",
  "토끼",
  "하프물범",
  "판다",
  "해달",
  "푸들",
  "호랑이",
  "하늘다람쥐",
  "하이에나",
  "한국호랑이",
  "햄스터",
  "황소",
];
function RandomName() {
  return names[Math.floor(Math.random() * names.length)];
}
const ID_BATTING_SLIDER = "batting-slider-wrapper";
const ID_BUTTON_ODD = "button-select-odd";
const ID_BUTTON_EVEN = "button-select-even";
const ID_BUTTON_RANDOM = "button-select-random";
const ID_BUTTON_GIVEUP = "button-select-give-up";
const ID_SECTION_USER = "user-section-A";
const ID_SECTION_COMP = "user-section-B";
const ID_TIMER = "timer";
const ID_BUTTON_CONNECT_TO_GAME_SERVER = "button-connect-to-game-server";
const ID_MY_POINT = "my-point";
const ID_OPPONENT_POINT = "opponent-point";
const ID_MY_USER_NAME = "my-user-name";
const ID_OPPONENT_NAME = "opponent-user-name";
const GAMEPOINT = 100;
const SECOND = 1000;
const WAITING_SECOND = 2;
const TIMER_INIT_SECOND = 25;

class Timer {
  constructor(timeout, id, cb) {
    this.init = timeout;
    this.remaining = timeout;
    this.timerId = null;
    this.cb = cb;
    this.element = document.getElementById(id);
  }
  hideTimer = () => {
    this.element.style.display = "none";
  };
  initTimer = () => {
    this.remaining = this.init;
  };
  startTimer = () => {
    if (this.remaining === 0) {
      this.cb();
    }
    this.element.style.display = "block";
    this.element.children[1].innerText = this.remaining;
    this.timerId = setTimeout(() => {
      this.remaining -= 1;
      if (this.remaining >= 0) {
        this.startTimer();
      }
    }, SECOND);
  };
  stopTimer = () => {
    // if (this.timerId) {
    clearTimeout(this.timerId);
    this.timerId = null;
    this.remaining = TIMER_INIT_SECOND;
    this.hideTimer();
    // }
  };
}
class Game {
  constructor() {
    this.socket = io("https://place.opensrcdesign.com/demo-game-server", {
      path: "/socket.io",
      transports: ["websocket", "polling", "flashsocket"],
    })
      .on("open", () => {
        console.log("open");
        this.setStatus("ZERO");
        this.setInitTurn();
      })
      .on("join", () => {
        console.log("join");
        this.socket.emit("who are you?", {
          data: { user: this.user },
          room: this.room,
        });
        this.socket.emit("message", {
          data: { status: "Ready", user: this.user },
          room: this.room,
        });
        this.setStatus("ZERO");
      })
      .on("I'm ", async (obj) => {
        await this.setOpponent(obj.user);
        this.setStatus("INIT");
      })
      .on("who are you?", async (obj) => {
        await this.setOpponent(obj.user);
        this.setStatus("INIT");
        this.socket.emit("I'm ", {
          data: { user: this.user },
          room: this.room,
        });
      })
      .on("message", (obj) => {
        console.log("message", obj);
        switch (obj.status) {
          case "INIT":
            this.socket.emit("message", {
              data: { status: "Ready", user: this.user },
              room: this.room,
            });
            break;
          case "Ready":
            // // console.log("Start", this.room);
            this.socket.emit("message", {
              data: { status: "Start" },
              room: this.room,
            });
            this.setStatus("SELECT");
            console.log("ready to select");
            break;
          case "Start":
            this.setStatus("SELECT");
            console.log("start to select");
            break;
          case "CHOSEN":
            console.log("CHOSEN", obj);
            this.setOpponent(obj.user);
            break;
          default:
            break;
        }
      })
      .on("chat", (obj) => {
        console.log("chat", obj);
      })
      .on("full", () => {
        alert("방이 이미 찼습니다, 방이름을 변경해주세요.");
        console.log("full");
      });
    this.room = null;
    this.opponent = null;
    this.user = null;
    this.turn = null;
    this.status = null;
    this.opener = false;
    this.timer = new Timer(TIMER_INIT_SECOND, ID_TIMER, () => {
      if (this.turn) {
        this.UserSelectRandom();
      } else {
        this.UserBattingAndSelectRandom();
      }
    });
  }
  setOpponent = (info) => {
    this.opponent = info;
    document.getElementById(ID_OPPONENT_NAME).innerText = info.name;
    document.getElementById(ID_OPPONENT_POINT).innerText = GAMEPOINT;
  };
  onBatting = (v) => {
    document.getElementById("batting_point").innerText = v;
    this.user.batting_point = parseInt(v);
  };
  getElementById = (id) => document.getElementById(id);
  isYourTurn = () => this.turn;
  cutOutlier = (num) =>
    num > GAMEPOINT * 2 ? GAMEPOINT * 2 : num < 0 ? num : num;

  setDisplay = (status) => {
    let intervalId = undefined;
    switch (status) {
      case "ZERO":
        document.getElementById("timer").style.display = "none";
        document.getElementById("you-lose").style.display = "none";
        document.getElementById("you-win").style.display = "none";
        document.getElementById("you-choose-one").style.display = "none";
        document.getElementById("waiting-opponent").style.display = "block";
        document.getElementById("selector").style.display = "none";
        break;
      case "INIT":
        document.getElementById("timer").style.display = "none";
        document.getElementById("you-lose").style.display = "none";
        document.getElementById("you-win").style.display = "none";
        document.getElementById("you-choose-one").style.display = "none";
        document.getElementById("waiting-opponent").style.display = "block";
        document.getElementById("selector").style.display = "none";

        break;

      case "SELECT":
        console.clear();
        console.log(this.opponent, this.user);
        console.log(this.isYourTurn() ? "yes" : "no");
        // this.timer.initTimer();
        // this.timer.startTimer();
        console.clear();
        console.log(this.user.point, this.user.batting_point);
        if (this.turn == false) {
          document.getElementById("batting_point").innerText = Math.ceil(
            this.user.point / 2
          );
          this.onBatting(
            parseInt(document.getElementById("batting_point").innerText)
          );
          document.getElementById("batting-slider").min = 1;
          document.getElementById("batting-slider").value =
            this.user.point === 1 ? 1 : Math.ceil(this.user.point / 2);
          document.getElementById("batting-slider").max = this.user.point;
          document.getElementById("batting-slider").onchange = (event) =>
            this.onBatting(event.target.value);
        }

        document.getElementById("waiting-opponent").style.display = "none";
        document.getElementById("selector").style.display = "block";
        document.getElementById("radom-button-div").style.display = this.turn
          ? "block"
          : "none";
        document.getElementById(ID_BATTING_SLIDER).style.display = this.turn
          ? "none"
          : "block";
        break;

      case "CHOSEN":
        // this.timer.stopTimer();
        // this.timer.hideTimer();

        document.getElementById(ID_TIMER).style.display = "none";
        document.getElementById("you-lose").style.display = "none";
        document.getElementById("you-win").style.display = "none";
        document.getElementById("you-choose-one").style.display = "block";
        document.getElementById("selector").style.display = "none";
        document.getElementById("which-you-choose").innerText =
          this.user.selected === "odd" ? "홀" : "짝";

        // if (this.user.selected && this.opponent.selected) {
        //   this.setStatus("EVAL");
        // }
        intervalId = setInterval(() => {
          console.log(this.user.selected, this.opponent.selected);
          if (this.user.selected && this.opponent.selected) {
            clearInterval(intervalId);
            this.setStatus("EVAL");
          }
        }, 500);
        break;

      case "EVAL":
        document.getElementById("you-choose-one").style.display = "none";
        let are_you_win = false;
        let batting_point = 0;

        // 너 맞출 차례
        if (this.isYourTurn()) {
          batting_point = this.opponent.batting_point;

          // 너 맞춤 너점수
          if (this.user.selected === this.opponent.selected) {
            are_you_win = true;
            // alert("your turn, you correct");
          }
          // 너 틀림 너점수
          else {
            are_you_win = false;
            // alert("your turn, you wrong");
          }
        }
        // 상대 맞출차례
        else {
          batting_point = this.user.batting_point;
          // 상대 맞춤 너점수
          if (this.opponent.selected === this.user.selected) {
            are_you_win = false;
            // alert("computer turn, computer correct");

            // 상대 틀림
          } else {
            // alert("computer turn, computer wrong");
            are_you_win = true;
          }
        }

        if (are_you_win) {
          this.user.point = this.cutOutlier(this.user.point + batting_point);
          this.opponent.point = this.cutOutlier(
            this.opponent.point - batting_point
          );

          document.getElementById("earn").innerText = "+" + batting_point;
          document.getElementById("you-win").style.display = "block";
        } else {
          this.user.point = this.cutOutlier(this.user.point - batting_point);
          this.opponent.point = this.cutOutlier(
            this.opponent.point + batting_point
          );
          document.getElementById("lose").innerText = "-" + batting_point;
          document.getElementById("you-lose").style.display = "block";
        }

        document.getElementById(ID_MY_POINT).innerText = this.user.point;
        document.getElementById(ID_OPPONENT_POINT).innerText =
          this.opponent.point;

        setTimeout(async () => {
          if (this.opponent.point > 0 && this.user.point > 0) {
            this.setTurn(!this.turn);
            this.setStatus("INIT");

            this.user.selected = null;
            this.opponent.selected = null;

            !this.opener &&
              this.socket.emit("message", {
                data: { status: "Ready" },
                room: this.room,
              });
          } else {
            if (this.opponent.point > this.user.point) {
              alert("상대가 이겼습니다. 게임을 다시 시작합니다!");
            } else {
              alert("당신이 이겼습니다. 게임을 다시 시작합니다!");
            }
            // alert("게임 끝!");
            window.history.go(0);
          }
        }, SECOND * WAITING_SECOND);
        break;

      default:
        break;
    }
  };
  setStatus = (status) => {
    this.status = status;
    this.setDisplay(status);
  };
  setTurn = (turn) => (this.turn = turn);
  join = async () => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const room = params.get("room");
    const isOpener = params.get("isOpener");
    if (room == undefined) {
      window.location.href = `?room=${encodeURIComponent(this.user.name)}`;
      return;
    }
    if (isOpener == undefined) {
      this.setTurn(false);
    } else {
      this.setTurn(true);
      this.opener = true;
    }
    this.room = encodeURIComponent(room);
    this.socket.emit("join", this.room);
  };
  swapTurn = async () => {};
  UserSelectOdd = () => {
    this.user.selected = "odd";
    this.socket.emit("message", {
      data: { status: "CHOSEN", user: this.user },
      room: this.room,
    });
    this.setStatus("CHOSEN");
  };
  UserSelectEven = () => {
    this.user.selected = "even";
    this.socket.emit("message", {
      data: { status: "CHOSEN", user: this.user },
      room: this.room,
    });
    this.setStatus("CHOSEN");
  };
  UserSelectRandom = () => {
    Math.floor(Math.random() * 2) === 1
      ? this.UserSelectOdd()
      : this.UserSelectEven();
  };
  UserBattingRandom = () => {
    const batting_point = Math.floor(Math.random() * this.user.point);

    document.getElementById("batting_point").innerText =
      batting_point === 0 ? 1 : batting_point;

    this.onBatting(parseInt(batting_point === 0 ? 1 : batting_point));
  };
  UserBattingAndSelectRandom = () => {
    this.UserSelectRandom();
    this.UserBattingRandom();
  };
  UserHaveGiveUp = () => {
    alert("게임을 포기하였습니다.");
    window.history.go(-1);
  };
}

function OddEvenGame() {
  console.log("\\OPEN PLACE ODD EVEN GAME GETTING STARTED/");
  const player1 = {
    name: RandomName(),
    point: GAMEPOINT,
    element: document.getElementById(ID_SECTION_USER),
    selected: null,
    batting_point: 0,
    url: null,
  };
  const game = new Game();
  // setting
  document.getElementById(ID_BUTTON_ODD).onclick = game.UserSelectOdd;
  document.getElementById(ID_BUTTON_EVEN).onclick = game.UserSelectEven;
  document.getElementById(ID_BUTTON_RANDOM).onclick = game.UserSelectRandom;
  document.getElementById(ID_BUTTON_GIVEUP).onclick = game.UserHaveGiveUp;

  game.user = player1;
  document.getElementById(ID_MY_USER_NAME).innerText = player1.name;
  game.join();

  // for debugging
  const swap = document.createElement("button");
  swap.innerText = "debug:swap";
  swap.onclick = () => game.swapTurn();
  const debug = document.getElementById("debug");
  debug.style.position = "absolute";
  debug.style.top = 0;
  debug.style.left = 0;

  // debug.appendChild(swap);
  const reset = document.createElement("button");
  reset.innerText = "debug:reset";
  reset.onclick = () => game.setStatus("INIT");
  // debug.appendChild(reset);

  // '
  document.getElementById(ID_OPPONENT_POINT).innerText = GAMEPOINT;
  document.getElementById(ID_MY_POINT).innerText = GAMEPOINT;

  console.log(game);
  // '
}

OddEvenGame();
