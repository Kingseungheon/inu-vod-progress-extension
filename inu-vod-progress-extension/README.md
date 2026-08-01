# INU 사이버캠퍼스 진도율 표시

인천대학교 사이버캠퍼스 메인 화면에서 강좌별 동영상 진도율을 퍼센트로 보여 주는 Chrome 확장 프로그램입니다.

자동재생, 팝업 자동 확인, 다음 차시 이동, 남은 시간 계산 기능은 포함하지 않습니다.

## 기능

- 사이버캠퍼스에 표시된 강좌 목록 자동 수집
- 온라인 출석부의 `O`/`X` 상태를 이용한 진도율 계산
- 강좌별 진도율을 `0%`부터 `100%`까지 표시
- 진도율이 낮은 강좌부터 정렬
- 진도율 새로고침 및 강좌 페이지 바로가기

## 직접 설치

1. GitHub 저장소에서 `Code` → `Download ZIP`을 선택합니다.
2. 내려받은 ZIP 파일의 압축을 풉니다.
3. Chrome 주소창에 `chrome://extensions`를 입력합니다.
4. 우측 상단의 `개발자 모드`를 켭니다.
5. `압축해제된 확장 프로그램을 로드합니다`를 누릅니다.
6. `manifest.json`이 들어 있는 이 폴더를 선택합니다.
7. 인천대학교 사이버캠퍼스에 로그인한 후 메인 화면을 새로고침합니다.

## GitHub 저장소에 올리기

새 GitHub 저장소를 만든 뒤 이 폴더에서 다음 명령을 실행합니다.

```powershell
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin https://github.com/GITHUB_ID/REPOSITORY_NAME.git
git push -u origin main
```

`GITHUB_ID`와 `REPOSITORY_NAME`은 실제 GitHub 계정과 저장소 이름으로 바꿔야 합니다.

## 배포용 ZIP 만들기

이 폴더 안에서 다음 명령을 실행하면 `manifest.json`이 ZIP 최상위에 포함된 배포 파일을 만들 수 있습니다.

```powershell
Compress-Archive -Path manifest.json,content.js,README.md -DestinationPath inu-vod-progress-extension-v1.0.0.zip
```

완성된 ZIP 파일은 GitHub 저장소의 `Releases` → `Create a new release`에서 첨부할 수 있습니다.

GitHub에 올린 ZIP만으로 Chrome에 자동 설치되지는 않습니다. 사용자는 위의 개발자 모드 방식으로 설치해야 합니다. 일반 사용자가 개발자 모드 없이 설치하고 자동 업데이트를 받게 하려면 Chrome Web Store 등록이 필요합니다.

## 공식 참고 자료

- [Chrome 확장 프로그램 로컬 설치](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Chrome Web Store 배포](https://developer.chrome.com/docs/webstore/publish/)
- [GitHub Release 만들기](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

## 동작 범위와 개인정보

- `https://cyber.inu.ac.kr`에서만 실행됩니다.
- 현재 로그인된 사이버캠퍼스 세션으로 온라인 출석부를 읽습니다.
- 외부 서버로 강좌명이나 진도 데이터를 전송하지 않습니다.
- 별도의 브라우저 권한을 요청하지 않습니다.
