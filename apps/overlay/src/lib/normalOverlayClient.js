/* eslint-env jquery */
/* global io, */
const socket = io({ transports: ['websocket'] });
const pageUrl = window.location.href;
const topMessages = [];
let messageHtml;

function getOS() {
  const { userAgent } = window.navigator;
  const { platform } = window.navigator;
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
  const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
  let os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }
  return os;
}

const device = getOS();
const CHECK_MESSAGE_INTERVAL_MS = 2000; // 구매메시지 큐 체크 간격 시간 ms
const MESSAGE_MIN_TIME_MS = 4000; // 메시지란 최소 게시 시간 ms
const FADEOUT_TIME_MS = 400; // 메시지란이 사라지는 시간 (fadeout 시간) ms
const FADEOUT_AFTER_TTS_MS = 300; // 음성이 끝난 뒤 메시지란이 사라지기까지의 시간 ms
const FALLBACK_IMAGE_SRC = '/images/invisible.png';
function startMessage(messageHtml) {
  $('.donation').css({ display: 'flex' });
  $('.donation').html(messageHtml);
}
function endMessage() {
  // $.fadeOut() -> 해당 ms시간 이후 display: none으로 만듬
  $('.donation').fadeOut(FADEOUT_TIME_MS, () => {
    $('.donation-image').attr('src', FALLBACK_IMAGE_SRC);
  });
}
// 매 CHECK_MESSAGE_INTERVAL_MS 초마다 구매 메시지 큐 체크하여 메시지 송출
setInterval(async () => {
  if (topMessages.length !== 0 && $('.donation').css('display') === 'none') {
    const currentMessage = topMessages.shift();
    const { messageHtml, audioBlob } = currentMessage;
    startMessage(messageHtml);
    if (audioBlob) {
      const sound = new Audio(audioBlob);
      sound
        .play()
        .then(() => {
          sound.addEventListener('ended', () => {
            setTimeout(() => {
              endMessage();
            }, FADEOUT_AFTER_TTS_MS);
            sound.remove();
          });
        })
        .catch(() => {
          setTimeout(() => {
            endMessage();
            sound.remove();
          }, MESSAGE_MIN_TIME_MS);
        });
    } else {
      setTimeout(() => {
        endMessage();
      }, MESSAGE_MIN_TIME_MS);
    }
  }
}, CHECK_MESSAGE_INTERVAL_MS);

socket.emit('new client', { pageUrl: pageUrl.replace('/donation', ''), device });

// 구매알림 큐에 등록
socket.on('show-normal-purchase-message', (data) => {
  const { imageSrc, purchase, audioBuffer } = data;
  const { message, nickname, purchaseNum, productName } = purchase;

  let audioBlob;
  if (audioBuffer) {
    const blob = new Blob([audioBuffer], { type: 'audio/mp3' });
    audioBlob = window.URL.createObjectURL(blob);
  }

  messageHtml = `
  <div class="donation-wrapper">
      <div class="centered">
          <img class="donation-image" alt="" src="${
            imageSrc || FALLBACK_IMAGE_SRC
          }" onerror="if (this.src != '${FALLBACK_IMAGE_SRC}') this.src= '${FALLBACK_IMAGE_SRC}';" />

          <div class="animated heartbeat" id="donation-top">
              <span id="nickname">
                  <span class="animated heartbeat" id="donation-user-id">${nickname}</span>
                  <span class="donation-sub">님 ${productName}</span>
                  <span class="animated heartbeat" id="donation-num">${purchaseNum}</span>
                  <span class="donation-sub">원 구매!</span>
              </span>
          </div>

          <div class="animated tada delay-1s" id="donation-message">
              <span id="message">
                  ${message}
              </span>
          </div>
      </div>
  </div>`;

  topMessages.push({ audioBlob, messageHtml });
});
