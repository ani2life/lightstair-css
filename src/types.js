/**
 * 설정 객체. `templates/lightstair-css.yml`의 기본값과 동일한 구조입니다.
 * L, C, H 값은 OKLCH 색상 공간 기준입니다.
 * @typedef {object} LightstairConfig
 * @property {number} tx_base_c - 기본 글자 채도
 * @property {number} tx_base_h - 기본 글자 색상
 * @property {number} bg_base_c - 기본 배경 채도
 * @property {number} bg_base_h - 기본 배경 색상
 * @property {number} bd_base_c - 기본 테두리 채도
 * @property {number} bd_base_h - 기본 테두리 색상
 * @property {number} tx_init_l - 초기 글자 밝기
 * @property {number} bg_init_l - 초기 배경 밝기
 * @property {number} bd_init_l - 초기 테두리 밝기
 * @property {number} dark_tx_init_l - 다크모드 초기 글자 밝기
 * @property {number} dark_bg_init_l - 다크모드 초기 배경 밝기
 * @property {number} dark_bd_init_l - 다크모드 초기 테두리 밝기
 * @property {number} tx_l_gap - 글자 밝기 간격
 * @property {number} bg_l_gap - 배경 밝기 간격
 * @property {number} bd_l_gap - 테두리 밝기 간격
 * @property {number} dark_tx_l_gap - 다크모드 글자 밝기 간격
 * @property {number} dark_bg_l_gap - 다크모드 배경 밝기 간격
 * @property {number} dark_bd_l_gap - 다크모드 테두리 밝기 간격
 * @property {number} tx_l_steps - 글자 밝기 단계 수
 * @property {number} bg_l_steps - 배경 밝기 단계 수
 * @property {number} bd_l_steps - 테두리 밝기 단계 수
 * @property {string} tx_prefix - 글자색 CSS 변수 접두어
 * @property {string} bg_prefix - 배경색 CSS 변수 접두어
 * @property {string} bd_prefix - 테두리색 CSS 변수 접두어
 * @property {number} preview_tx_l - 미리보기 글자 밝기
 * @property {number} preview_tx_c - 미리보기 글자 채도
 * @property {number} preview_tx_h - 미리보기 글자 색상
 * @property {number} preview_bg_l - 미리보기 배경 밝기
 * @property {number} preview_bg_c - 미리보기 배경 채도
 * @property {number} preview_bg_h - 미리보기 배경 색상
 * @property {number} dark_preview_tx_l - 다크모드 미리보기 글자 밝기
 * @property {number} dark_preview_tx_c - 다크모드 미리보기 글자 채도
 * @property {number} dark_preview_tx_h - 다크모드 미리보기 글자 색상
 * @property {number} dark_preview_bg_l - 다크모드 미리보기 배경 밝기
 * @property {number} dark_preview_bg_c - 다크모드 미리보기 배경 채도
 * @property {number} dark_preview_bg_h - 다크모드 미리보기 배경 색상
 */

/**
 * CSS 변수 하나의 색상 값을 각 포맷별 문자열로 보관합니다.
 * @typedef {object} ColorValue
 * @property {string} oklch - oklch() 표기 문자열
 * @property {string} rgb - rgb() 표기 문자열
 * @property {string} hex - #rrggbb 표기 문자열
 */

/**
 * `generateColorVars` 반환 객체. 키는 `--tx-1` 형태의 CSS 변수명입니다.
 * @typedef {Record<string, { light: ColorValue, dark: ColorValue }>} ColorVars
 */

/**
 * `generateBakedCSS`의 색상 출력 포맷.
 * @typedef {'oklch' | 'rgb' | 'hex'} ColorFormat
 */

export {};
