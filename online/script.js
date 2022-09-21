const ID_BATTING_SLIDER = "batting-slider-wrapper";

const ID_BUTTON_ODD = "button-select-odd";
const ID_BUTTON_EVEN = "button-select-even";
const ID_BUTTON_RANDOM = "button-select-random";
const ID_BUTTON_GIVEUP = "button-select-give-up";
const ID_SECTION_USER = "user-section-A";
const ID_SECTION_COMP = "user-section-B";
const ID_TIMER = "timer";
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
    // this.remaining = TIMER_INIT_SECOND;
    // }
  };
}
class Game {
  constructor() {
    this.users = [];
    this.user = null;
    this.turn = 0;
    this.status = null;
    this.timer = new Timer(TIMER_INIT_SECOND, ID_TIMER, () => {
      if (this.isYourTurn()) {
        this.UserSelectRandom();
      } else {
        this.UserBattingAndSelectRandom();
      }
    });
  }
  getElementById = (id) => document.getElementById(id);

  onBatting = (v) => {
    document.getElementById("batting_point").innerText = v;
    this.users[0].batting_point = parseInt(v);
  };
  isYourTurn = () => this.turn === 0;
  cutOutlier = (num) =>
    num > GAMEPOINT * 2 ? GAMEPOINT * 2 : num < 0 ? num : num;

  setDisplay = (status) => {
    switch (status) {
      case "INIT":
        document.getElementById("timer").style.display = "none";
        document.getElementById("you-lose").style.display = "none";
        document.getElementById("you-win").style.display = "none";
        document.getElementById("you-choose-one").style.display = "none";
        document.getElementById("waiting-opponent").style.display = "block";
        document.getElementById("selector").style.display = "none";

        // for dev
        setTimeout(() => {
          this.setStatus("SELECT");
        }, SECOND);

        break;

      case "SELECT":
        this.timer.initTimer();
        this.timer.startTimer();

        if (!this.isYourTurn()) {
          document.getElementById("batting_point").innerText = Math.ceil(
            this.users[0].point / 2
          );
          this.onBatting(
            parseInt(document.getElementById("batting_point").innerText)
          );
          document.getElementById("batting-slider").min = 1;
          document.getElementById("batting-slider").value =
            this.users[0].point === 1 ? 1 : Math.ceil(this.users[0].point / 2);
          document.getElementById("batting-slider").max = this.users[0].point;
          document.getElementById("batting-slider").onchange = (event) =>
            this.onBatting(event.target.value);
        }
        document.getElementById("waiting-opponent").style.display = "none";
        document.getElementById("selector").style.display = "block";
        document.getElementById("radom-button-div").style.display =
          this.turn === 0 ? "block" : "none";
        document.getElementById(ID_BATTING_SLIDER).style.display =
          this.turn === 0 ? "none" : "block";

        //  for local
        this.users[1].selected =
          Math.floor(Math.random() * 2) === 0 ? "odd" : "even";
        // for debug
        const result = document.createElement("div");
        result.innerText =
          "상대가 " +
          (this.users[1].selected === "odd" ? "홀" : "짝") +
          " 선택하였습니다.";
        document.getElementById("debug").appendChild(result);

        //
        if (this.isYourTurn()) {
          setTimeout(() => {
            this.users[1].batting_point =
              Math.floor(Math.random() * this.users[1].point) || 1;

            const result = document.createElement("div");
            result.innerText =
              "상대가 " + this.users[1].batting_point + "만큼 배팅했습니다.";
            document.getElementById("debug").appendChild(result);
          }, SECOND);
        }
        break;

      case "CHOSEN":
        document.getElementById(ID_TIMER).style.display = "none";
        document.getElementById("you-lose").style.display = "none";
        document.getElementById("you-win").style.display = "none";
        document.getElementById("you-choose-one").style.display = "block";
        document.getElementById("selector").style.display = "none";
        document.getElementById("which-you-choose").innerText =
          this.users[0].selected === "odd" ? "홀" : "짝";

        setTimeout(() => {
          this.setStatus("EVAL");
        }, SECOND);

        break;

      case "EVAL":
        this.timer.stopTimer();
        this.timer.hideTimer();

        document.getElementById("you-choose-one").style.display = "none";
        let are_you_win = false;
        let batting_point = 0;

        // 너 맞출 차례
        if (this.isYourTurn()) {
          batting_point = this.users[1].batting_point;

          // 너 맞춤 너점수
          if (this.users[0].selected === this.users[1].selected) {
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
          batting_point = this.users[0].batting_point;
          // 상대 맞춤 너점수
          if (this.users[1].selected === this.users[0].selected) {
            are_you_win = false;
            // alert("computer turn, computer correct");

            // 상대 틀림
          } else {
            // alert("computer turn, computer wrong");
            are_you_win = true;
          }
        }

        if (are_you_win) {
          this.users[0].point = this.cutOutlier(
            this.users[0].point + batting_point
          );
          this.users[1].point = this.cutOutlier(
            this.users[1].point - batting_point
          );

          document.getElementById("earn").innerText = "+" + batting_point;
          document.getElementById("you-win").style.display = "block";
        } else {
          this.users[0].point = this.cutOutlier(
            this.users[0].point - batting_point
          );
          this.users[1].point = this.cutOutlier(
            this.users[1].point + batting_point
          );
          document.getElementById("lose").innerText = "-" + batting_point;
          document.getElementById("you-lose").style.display = "block";
        }

        document.getElementById("my-point").innerText = this.users[0].point;
        document.getElementById("opponent-point").innerText =
          this.users[1].point;

        setTimeout(() => {
          if (this.users[1].point > 0 && this.users[0].point > 0) {
            this.swapTurn();
          } else {
            if (this.users[1].point > this.users[0].point) {
              alert("컴퓨터가 이겼습니다. 게임을 다시 시작합니다!");
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
  join = async (player) => {
    await this.users.push(player);
    this.user = this.users[0];
  };
  setTurn = (index) => {
    this.turn = index;
  };
  swapTurn = () => {
    this.setTurn(this.turn === 0 ? 1 : 0);
    this.setStatus("INIT");
  };
  setInitTurn = () => {
    // this.setTurn(Math.floor(Math.random() * this.users.length));
    this.setTurn(0);
  };

  UserSelectOdd = () => {
    this.user.selected = "odd";
    this.setStatus("CHOSEN");
  };
  UserSelectEven = () => {
    this.user.selected = "even";
    this.setStatus("CHOSEN");
  };
  UserSelectRandom = () => {
    Math.floor(Math.random() * 2) === 1
      ? this.UserSelectOdd()
      : this.UserSelectEven();
    this.timer.stopTimer();
  };
  UserBattingRandom = () => {
    const batting_point = Math.floor(Math.random() * this.users[0].point);

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
    name: "유저1",
    point: GAMEPOINT,
    element: document.getElementById(ID_SECTION_USER),
    selected: null,
    batting_point: 0,
  };
  const player2 = {
    name: "컴퓨터1",
    point: GAMEPOINT,
    element: document.getElementById(ID_SECTION_COMP),
    selected: null,
    batting_point: 0,
  };

  const game = new Game();
  // setting
  document.getElementById(ID_BUTTON_ODD).onclick = game.UserSelectOdd;
  document.getElementById(ID_BUTTON_EVEN).onclick = game.UserSelectEven;
  document.getElementById(ID_BUTTON_RANDOM).onclick = game.UserSelectRandom;
  document.getElementById(ID_BUTTON_GIVEUP).onclick = game.UserHaveGiveUp;

  game.join(player1);
  game.join(player2);

  game.setInitTurn();

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
  //
  document.getElementById("opponent-point").innerText = GAMEPOINT;
  document.getElementById("my-point").innerText = GAMEPOINT;
  game.setStatus("INIT");

  console.log(game);
}

OddEvenGame();
