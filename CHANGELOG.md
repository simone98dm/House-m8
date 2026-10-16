# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 0.10.0 (2026-10-16)


### Features

* security hardening, Tailwind 4 migration and legal pages ([0f8ee78](https://github.com/simone98dm/HouseM8/commit/0f8ee78d8e6f0a6e3101c67b469b3b425e170e07))

## 0.9.0 (2026-08-20)


### Features

* import House m8 application codebase ([8c89d8f](https://github.com/simone98dm/House-m8/commit/8c89d8f60c2ff90efb8c3cd18890a75e38007f40))


### Bug Fixes

* update version number to 0.8.0 in package.json ([d6968c6](https://github.com/simone98dm/House-m8/commit/d6968c656d9cba915591230b2dc96b67c58315ac))
* **a11y:** raise text contrast to WCAG AA on shared surfaces ([d714344](https://github.com/simone98dm/House-m8/commit/d71434465f2cf539667910e59942ec0088fd51fa))
* **security:** escape template variables in email HTML ([ea64d5d](https://github.com/simone98dm/House-m8/commit/ea64d5d721e7e2f276e9020fb1a080469e07e291))
* track server email templates excluded by the gitignore ([0c8ac79](https://github.com/simone98dm/House-m8/commit/0c8ac7999e27072fe63d4e96d0d893fff6a20d6b))


### Chores

* initial repository bootstrap ([6d425fc](https://github.com/simone98dm/House-m8/commit/6d425fc81fa8262f2309dfa799f1a966737f8b81))

## 1.8.0 (2026-08-19)


### Features

* implement house plan limits and role-based access control ([a6e2014](https://github.com/simone98dm/house-m8-fe/commit/a6e2014b7d8658d63ea5095743f6615b1142685e))


### Bug Fixes

* contrast and a11y failures found by the phase 9 audit re-run ([95fbc17](https://github.com/simone98dm/house-m8-fe/commit/95fbc176c539409b1f5fa961a62355b371bee081))
* remove _authToken from .npmrc, it breaks every yarn command ([149f8ab](https://github.com/simone98dm/house-m8-fe/commit/149f8ab2ea41c408c47259397dc6f5616537f866))


### Documentation

* add optimization plan execution record, phase handovers and audits ([0056175](https://github.com/simone98dm/house-m8-fe/commit/0056175610a86cbc6f519f333875c55c0706ea1f))
* update license ([4b31c19](https://github.com/simone98dm/house-m8-fe/commit/4b31c191a7f88ceb65ac101966a22a4bcd7fa38c))


### Chores

* code structure for improved readability and maintainability ([fcd0af2](https://github.com/simone98dm/house-m8-fe/commit/fcd0af2d9a0fd727eac45b3d72c014116f749de8))
* fix token ([6dfb882](https://github.com/simone98dm/house-m8-fe/commit/6dfb882e5cb1cc7c5afc8022dac9c7d998143fd9))
* update .npmrc to include GITHUB_TOKEN for authentication ([8f87bb9](https://github.com/simone98dm/house-m8-fe/commit/8f87bb9adaf7bec8da07da1d105b0d835058a351))
* fix bill creation ([28dae18](https://github.com/simone98dm/house-m8-fe/commit/28dae1886ee381d83ce10c86b8640aa359284318))
* fix cards ([2ed6313](https://github.com/simone98dm/house-m8-fe/commit/2ed6313d4e34f2b3dab0841403cee481e2271b6f))
* add missing file ([2a40c3a](https://github.com/simone98dm/house-m8-fe/commit/2a40c3a010473824150c553b677ea3405d9e9ba2))
* fix email template ([e2b7e33](https://github.com/simone98dm/house-m8-fe/commit/e2b7e33a78f9df192c4bd045d853235324459ab1))
* bug fix and minor improvements ([4c9ad53](https://github.com/simone98dm/house-m8-fe/commit/4c9ad5383b928b73980b58d9a926bc735eb99076))
* bug fix and minor improvmente ([725b8af](https://github.com/simone98dm/house-m8-fe/commit/725b8afd0c5b7f435031e7d3e9c79a221430feff))
* add files ([d68e204](https://github.com/simone98dm/house-m8-fe/commit/d68e20455addc41af787baa1b06f5e180fc2e33a))

## 1.7.0 (2026-05-29)


### Chores

* add screenshot ([3180d6e](https://github.com/simone98dm/house-m8-fe/commit/3180d6ef23627aacda75f56245e48c5b71c102ca))

## 1.6.0 (2026-05-29)


### Features

* wire profile picture upload in AccountSetupWizard behind feature flag ([4f7d834](https://github.com/simone98dm/house-m8-fe/commit/4f7d834a20eb2b6f953469d88b0b2a9a75fe0248))
* add uploadPicture and deletePicture to useUserApi ([8eaef07](https://github.com/simone98dm/house-m8-fe/commit/8eaef07c7e496026992bbeb959c2e63fc408abb9))
* expose profile-pictures feature flag to public API ([8026e56](https://github.com/simone98dm/house-m8-fe/commit/8026e5647f9a8af27ee256d7a37ee5f031632375))


### Bug Fixes

* handle uploadPicture error in AccountSetupWizard ([2c26174](https://github.com/simone98dm/house-m8-fe/commit/2c26174f1f2cb25dcf4d460a74bec36c45257003))


### Chores

* temporary skil typecheck ([c8f59c0](https://github.com/simone98dm/house-m8-fe/commit/c8f59c025106c594ec9569f9e2dc179532a7ffdc))
* fix coverage ([b9f895e](https://github.com/simone98dm/house-m8-fe/commit/b9f895e9bacc2409ddb5d36e145a06e82ee42383))
* fixnuxi typescheck ([c035f25](https://github.com/simone98dm/house-m8-fe/commit/c035f25ccbd46e5d1d74beb1961543bb0ef8dad3))

## 1.5.0 (2026-05-29)


### Features

* align language switcher layout to match theme selector (label-left, select-right) ([79efacc](https://github.com/simone98dm/house-m8-fe/commit/79efacc76d2ba0572cc061459dff1a4ac5d5b68e))
* move theme selector into profile settings card, remove /settings/appearance page ([d296ae2](https://github.com/simone98dm/house-m8-fe/commit/d296ae20b26070ba53260972cf9fad74ce00962c))
* dark mode for all remaining pages ([cc8608e](https://github.com/simone98dm/house-m8-fe/commit/cc8608ef620e62b5f8651f096763f1dc7ca3e3ca))
* dark mode for auth pages, index, and house/join ([e075f9e](https://github.com/simone98dm/house-m8-fe/commit/e075f9edd88ceb3ada2b08a534b2eee040991950))
* dark mode for landing and page/* components ([5e3ca03](https://github.com/simone98dm/house-m8-fe/commit/5e3ca03d28c356f95734613ff63d0aa4b6a2e8eb))
* dark mode for user/Profile and user/profile/* components ([9867717](https://github.com/simone98dm/house-m8-fe/commit/9867717c2289dd43b5ee96e9b4a962d7628b117c))
* dark mode for bulletin, gdpr, subscription, and user modal components ([ae6d171](https://github.com/simone98dm/house-m8-fe/commit/ae6d1716955d593a2f79cfb5ec1c977036f653d7))
* dark mode for house/* and report/* components ([8bbdda4](https://github.com/simone98dm/house-m8-fe/commit/8bbdda4d72e9df5518515018f2f363fcb9af5fe6))
* dark mode for dashboard/* and expense/* components ([d7e8313](https://github.com/simone98dm/house-m8-fe/commit/d7e83133aedab430df7ac04e84f2b398cb629ccb))
* dark mode for bill/* components ([2ad8a4d](https://github.com/simone98dm/house-m8-fe/commit/2ad8a4d4667f90a2492b88ba3179777de50d2575))
* dark mode for balance/* components ([c46fa0f](https://github.com/simone98dm/house-m8-fe/commit/c46fa0f9e1f398b06ae27e3a5253fd88403bf55b))
* dark mode for app shell components ([a48a037](https://github.com/simone98dm/house-m8-fe/commit/a48a037005b38c7eda9343bd2e8445e864ff427a))
* dark mode for all remaining ui/* primitive components ([f7e6db5](https://github.com/simone98dm/house-m8-fe/commit/f7e6db5323d5ce672b5bb5088b3380748c92fb5a))
* dark mode for Card, Skeleton, Notification components ([4d3240a](https://github.com/simone98dm/house-m8-fe/commit/4d3240a023b84bfad89ec02a55e02d1e78a0c543))
* dark mode for form input components ([0e3bc96](https://github.com/simone98dm/house-m8-fe/commit/0e3bc969e6dbe8d61556cf29ca84a4c0f92a773c))
* dark mode for ui/Modal and ui/ConfirmModal ([beec9ea](https://github.com/simone98dm/house-m8-fe/commit/beec9ea351e4eb157893da27fee2b20be16a8c01))
* dynamic theme-color meta in layout for dark mode ([52c2d55](https://github.com/simone98dm/house-m8-fe/commit/52c2d5507385346960395ba00527573cba69c231))
* add settings/appearance page with dark/light/system toggle ([02f8872](https://github.com/simone98dm/house-m8-fe/commit/02f887288af00992ed79e81781aeb3ec37f015bf))
* patch global component classes with dark mode variants ([91534bb](https://github.com/simone98dm/house-m8-fe/commit/91534bb3d2270d1db9262c4e8d10ba7abd6c8950))
* add dark CSS variable overrides and focus/scrollbar dark styles ([120840c](https://github.com/simone98dm/house-m8-fe/commit/120840c09d54e19bde48e2c2510ff73b7f369073))
* install @nuxtjs/color-mode, enable Tailwind class dark mode ([980aa01](https://github.com/simone98dm/house-m8-fe/commit/980aa017ab8e84f67d0dddb914c620cab625a503))
* **seo:** add OG tags and robots to public pages ([a39cd91](https://github.com/simone98dm/house-m8-fe/commit/a39cd91c0e65b61f290548737876b11261e9d54f))
* **seo:** add robots noindex to auth pages ([a364b7e](https://github.com/simone98dm/house-m8-fe/commit/a364b7ed6e57a6cb1e0a8d6ebb0bce7c6d04f38f))
* **seo:** add robots meta defaults to layout files ([b7284cd](https://github.com/simone98dm/house-m8-fe/commit/b7284cdc0e77d8e0e0ad3f79064e6e23f7bc0bed))
* **seo:** add global OG and Twitter Card meta tags in app.vue ([97dd75a](https://github.com/simone98dm/house-m8-fe/commit/97dd75aae3a3d62c0027e0545a66caf07cd7ebb2))
* **og-image:** add og-image.svg for social sharing ([ca03d47](https://github.com/simone98dm/house-m8-fe/commit/ca03d47682a0a0f7a30e31042b2e54130f81d957))
* **gdpr:** add gdpr compliance ([ab5dae3](https://github.com/simone98dm/house-m8-fe/commit/ab5dae3c7d31fae268c769412d3c93b4b56ea43e))


### Bug Fixes

* dark mode for secondary/outline buttons and no-debts banner ([575e725](https://github.com/simone98dm/house-m8-fe/commit/575e7257c3306387dee16925088b7a9029045f82))
* patch missed dark mode classes in gdpr, social, and user-not-found views ([56f211e](https://github.com/simone98dm/house-m8-fe/commit/56f211e531c1c787a698cbe2a9f0008c63e4ac39))
* add dark error state to UiSelect ([4705e1e](https://github.com/simone98dm/house-m8-fe/commit/4705e1e6462d0e75189d64785fcdec3da1b60839))
* **fonts:** move to local fonts ([a6d907d](https://github.com/simone98dm/house-m8-fe/commit/a6d907d07ae4118994fbebc402464688af38b964))
* **seo:** remove ogUrl trailing slash, move SVG pattern into defs, drop unused gradient ([83513ef](https://github.com/simone98dm/house-m8-fe/commit/83513efbd98496e87e735abc9c3e966b6f47fd8b))
* **i18n:** remove '- House M8' suffix from SEO titles, add pricing/privacy/terms keys ([7212012](https://github.com/simone98dm/house-m8-fe/commit/7212012d71f082a1befd64233053e555e6a2d2aa))


### Chores

* replace semantic-release with tagless changelog bump ([e07f211](https://github.com/simone98dm/house-m8-fe/commit/e07f2118972d11e89717fec29cc1e89da98dd4c2))
* upgrade the UI ([6478ef7](https://github.com/simone98dm/house-m8-fe/commit/6478ef7dcfca9bcc35a378b9c53da5026d57fdad))
* improve ff disable registration ([dbf2570](https://github.com/simone98dm/house-m8-fe/commit/dbf2570eec2ab138a831cb60cc39f3f3fba8e3ad))
* update the classes for background dark theme ([b384706](https://github.com/simone98dm/house-m8-fe/commit/b384706b5266af2790c8c28bbe507baea4b99de7))
* fix login oauth google ([4dd58d6](https://github.com/simone98dm/house-m8-fe/commit/4dd58d679591a1df8da8da093fba16d21be30ef6))
* fix gitignore folder ([e79878a](https://github.com/simone98dm/house-m8-fe/commit/e79878a54169755e88063358a8281a90b39cf1b5))
* add .superpowers to gitignore ([38c4508](https://github.com/simone98dm/house-m8-fe/commit/38c45084be69620c305a192eae2e398b9de0fa02))
* add registration under ff ([4b13de7](https://github.com/simone98dm/house-m8-fe/commit/4b13de77e48612ff1fa67c9ff181feaaf6dd9506))
* reduce number pooling db ([683da93](https://github.com/simone98dm/house-m8-fe/commit/683da93c86d7f9a69e905aa840883c96b91492d4))
* exclude auth for path that contains /api/ ([25be9cd](https://github.com/simone98dm/house-m8-fe/commit/25be9cdd443e34729329bc3eae047c3d52748d36))
* add missing file ([e906ad8](https://github.com/simone98dm/house-m8-fe/commit/e906ad87e771466f96c80af056cf4247604be478))
* **gh-pages:** remove github pages ([5b2a66b](https://github.com/simone98dm/house-m8-fe/commit/5b2a66b32370ed8361e2dfa52766e09f19605f35))
* fix bug ([035b0cc](https://github.com/simone98dm/house-m8-fe/commit/035b0cc7a216636a2c25a97836eb8d93f15fdaf2))
* fix balance ([ea2ba6c](https://github.com/simone98dm/house-m8-fe/commit/ea2ba6c8302bcccf572c506eeed897175db71258))
* improve the leaving house flow ([0078ead](https://github.com/simone98dm/house-m8-fe/commit/0078ead9f9574156ac3d38799cac72ad58555f5e))
* update ui ([f2f0c87](https://github.com/simone98dm/house-m8-fe/commit/f2f0c87f1102a1ec4c94ddce38bc8ebfb1ac6e35))
* create feature flags and add payment under it ([15a2f3e](https://github.com/simone98dm/house-m8-fe/commit/15a2f3eb6a18a78df41eb320f784008b3683d499))
* add missing export ([66dbc5c](https://github.com/simone98dm/house-m8-fe/commit/66dbc5c859b3f8eaf2d0f2725413acafbae11ce9))
* add import and env ([7e94a9d](https://github.com/simone98dm/house-m8-fe/commit/7e94a9d4874b967edd4847ae46442ac1f2b87957))
* cleanup code, remove dead code and reduce bundle size ([d26c4b2](https://github.com/simone98dm/house-m8-fe/commit/d26c4b2a4fec9791b967ccc14045c6b45177ebf7))
* add stripe to the app ([a92f013](https://github.com/simone98dm/house-m8-fe/commit/a92f0130f40196666a872a034d2b27be19e230d4))
* add tests ([687ab23](https://github.com/simone98dm/house-m8-fe/commit/687ab2337e5145b57ae0bdfb0e46ea1b7d51fc4c))
* upgrade node version ([c1bd59d](https://github.com/simone98dm/house-m8-fe/commit/c1bd59d0a33639d860bb1c5cfdd1e112923efd94))
* add template, pipeline and coverage ([a70b293](https://github.com/simone98dm/house-m8-fe/commit/a70b293324161e00d8172d61bad5bf3bf0f2b714))
* add workflow ([8144318](https://github.com/simone98dm/house-m8-fe/commit/814431810fc3ad3345f5fb63b4ae60dbb9539fde))
* recfactor and bug fix ([eed7a2c](https://github.com/simone98dm/house-m8-fe/commit/eed7a2c87e5b6298fc67e2fcbc3a1bbc892d4da1))
* delete workflow ([8faadf9](https://github.com/simone98dm/house-m8-fe/commit/8faadf96bb22b57f61537ccccce849731577269f))
* fix page ([fc8c5e9](https://github.com/simone98dm/house-m8-fe/commit/fc8c5e9391e3694d8dd4a5bd4a05c3de6476b12b))

## [1.1.0](https://github.com/simone98dm/house-m8-fe/compare/v1.0.0...v1.1.0) (2026-04-23)


### Features

* **a11y:** add aria-labels for buttons and enhance accessibility ([4d59cd2](https://github.com/simone98dm/house-m8-fe/commit/4d59cd2d94a0c9359c60d1bf9679846d9482387e))

## 1.0.2 (2025-11-04)

## [1.0.1](https://github.com/simone98dm/house-m8-fe/compare/v1.0.0...v1.0.1) (2025-10-31)

## 1.0.0 (2025-10-31)


### Features

* add all the feature needed ([de4f6cb](https://github.com/simone98dm/house-m8-fe/commit/de4f6cbd2d8dcbcc9b3c10aec6fad307f81f33df))
* add application icons and web manifest for pwa support ([eec8f7b](https://github.com/simone98dm/house-m8-fe/commit/eec8f7b6d05a5b6e338a3e40698f4da548d1368f))
* add helper functions for displaying user names in transactions ([9815fc9](https://github.com/simone98dm/house-m8-fe/commit/9815fc9a53e6539e15e210aa794bd34edb4f17dd))
* add internationalization support for various components and update translations ([82c8554](https://github.com/simone98dm/house-m8-fe/commit/82c8554519b52be72c4b9ed9d18172920f3dfe08))
* enhance styling and structure across components ([2be0eb7](https://github.com/simone98dm/house-m8-fe/commit/2be0eb7266fb23122d76f1a4462d612487479224))
* implement email confirmation flow for user registration ([fde27f7](https://github.com/simone98dm/house-m8-fe/commit/fde27f758febae64fc5a358a6dd0cab15bbba5bf))
* refactor architecture, create paid-upaid, add locales ([1deece4](https://github.com/simone98dm/house-m8-fe/commit/1deece43027ab36de33cd29f7d91174345e82acd))
* refactor to service layer architecture with useApi pattern ([eae7c0e](https://github.com/simone98dm/house-m8-fe/commit/eae7c0eb45898b1962500e51891355c98658a9ec))
* update currency display to use dynamic currency symbols across pages ([a9c4b36](https://github.com/simone98dm/house-m8-fe/commit/a9c4b36d90650e0449ff3cd28ac25317aa3ade42))
* update PWA configuration and remove obsolete web manifest ([e0c5ccd](https://github.com/simone98dm/house-m8-fe/commit/e0c5ccd1a0f9a77a927da528d3ac30dab087b3b1))


### Bug Fixes

* initialize BillsService with API fetch method ([504389f](https://github.com/simone98dm/house-m8-fe/commit/504389f25fc544a7135f46e5f008cc21dfa0913f))
