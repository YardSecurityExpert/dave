const paths={library:'M3 4h4v16H3z M10 4h4v16h-4z M17 4l3-1 3 16-3 1z',folder:'M3 7V5h7l2 3h9v12H3z M3 10h18',clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 6v6l-3 3',more:'M4 12h.01 M12 12h.01 M20 12h.01',store:'M4 4h16l1 6-2 3-3-1-4 1-4-1-3 1-2-3z M4 13v7h16v-7 M8 4v7 M16 4v7',temporary:'M5 5l2-2 M10 2h5 M18 4l3 4 M22 11v5 M19 19l-4 3 M12 22H7l-4-1 1-4 M2 13V8',panel:'M4 4h16v16H4z M9 4v16',edit:'M14 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-8 M16 3l4 4-9 9-5 1 1-5z',search:'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',images:'M14 8V4H5a2 2 0 0 0-2 2v10h5 M8 8h13v13H8z M8 17l4-4 3 3 2-2 4 4 M17 11h.01',plugins:'M12 15a3 3 0 1 1 3-3v3c0 3 5 2 5-3a8 8 0 1 0-3 6',research:'M3 11l18-7-6 17-4-7-8-3z M11 14l5-5 M5 17l-2 3 M7 19l-1 2',plans:'M12 3l8 5v9l-8 4-8-4V8z M9 12h6 M12 9v6',settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',help:'M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0 M6 6l4 4 M14 14l4 4 M18 6l-4 4 M10 14l-4 4',external:'M14 4h6v6 M20 4l-9 9 M10 5H5v14h14v-5',plus:'M12 4v16 M4 12h16',mic:'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3',arrow:'M12 19V5 M6 11l6-6 6 6',chevron:'M6 9l6 6 6-6',close:'M6 6l12 12 M18 6L6 18'};
const referenceIcons={"edit": {"content": "<g transform=\"translate(-0.06958 0.071777)\"><path d=\"M10 2.99998C10.5523 2.99998 11 3.44769 11 3.99998C10.9999 4.5522 10.5522 4.99998 10 4.99998H7C5.89543 4.99998 5 5.89541 5 6.99998V17C5.00007 18.1045 5.89547 19 7 19H17C18.1045 19 18.9999 18.1045 19 17V14C19 13.4477 19.4477 13 20 13C20.5523 13 21 13.4477 21 14V17C20.9999 19.2091 19.2091 21 17 21H7C4.7909 21 3.00007 19.2091 3 17V6.99998C3 4.79084 4.79086 2.99998 7 2.99998H10Z\" fill=\"currentColor\"></path> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M15.874 3.74607C17.0849 2.55338 19.0316 2.56095 20.2334 3.76267C21.438 4.96766 21.4413 6.91935 20.2412 8.12888L14.1699 14.249C13.6555 14.7673 13.0022 15.1262 12.2891 15.2832L9.42578 15.9131C8.60548 16.0935 7.8746 15.3622 8.05566 14.542L8.68652 11.6855C8.84479 10.9687 9.20751 10.3131 9.73047 9.79783L15.874 3.74607ZM18.8193 5.17673C18.3944 4.75189 17.7055 4.74918 17.2773 5.17088L11.1338 11.2226C10.8863 11.4666 10.7146 11.7769 10.6396 12.1162L10.2959 13.6748L11.8594 13.3301C12.1972 13.2557 12.5063 13.0853 12.75 12.8398L18.8223 6.72068C19.2464 6.29307 19.245 5.60279 18.8193 5.17673Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 24 24"}, "images": {"content": "<g transform=\"translate(0.033248 0.033264)\"><path d=\"M10.7505 10.0005C11.8548 10.0007 12.7505 10.896 12.7505 12.0005C12.7502 13.1046 11.8546 14.0002 10.7505 14.0005C9.64604 14.0005 8.75071 13.1048 8.75045 12.0005C8.75045 10.8959 9.64588 10.0005 10.7505 10.0005Z\" fill=\"currentColor\"></path> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.17916 4.63326C8.47138 2.55523 10.3931 1.10792 12.4712 1.39986L19.7993 2.42916C21.8774 2.72132 23.3256 4.64303 23.0337 6.72115L22.0034 14.0493C21.7112 16.1274 19.7895 17.5756 17.7114 17.2837L16.7749 17.1508L16.7837 17.2114C17.0756 19.2895 15.6274 21.2112 13.5493 21.5034L6.22115 22.5337C4.14303 22.8256 2.22132 21.3774 1.92916 19.2993L0.899864 11.9712C0.607915 9.89307 2.05523 7.97138 4.13326 7.67916L7.82369 7.15963L8.17916 4.63326ZM7.70455 16.394C7.04302 15.8962 6.1033 16.0287 5.60494 16.6899L3.89986 18.9516L3.90963 19.021C4.04807 20.0052 4.95853 20.6914 5.94283 20.5532L12.0786 19.6899L7.70455 16.394ZM11.7397 8.63033L4.41158 9.65963C3.42738 9.79813 2.74211 10.7086 2.88033 11.6928L3.50631 16.1499L4.00729 15.4858C5.17064 13.9422 7.36594 13.6341 8.90963 14.7973L14.3774 18.9184C14.7065 18.539 14.8785 18.0262 14.8032 17.4897L13.7729 10.1616C13.6344 9.17735 12.724 8.49211 11.7397 8.63033ZM12.1928 3.38033C11.2086 3.24211 10.2981 3.92738 10.1596 4.91158L9.88424 6.87057L11.4614 6.64889C13.5395 6.35694 15.4612 7.80521 15.7534 9.88326L16.4848 15.0913L17.9897 15.3032C18.974 15.4414 19.8845 14.7552 20.0229 13.771L21.0532 6.44283C21.1914 5.45853 20.5052 4.54807 19.521 4.40963L12.1928 3.38033Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 24 24"}, "library": {"content": "<g transform=\"translate(-0.355957 0.196289)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M16.9224 2.65041C18.445 2.38198 19.8967 3.39841 20.1655 4.92092L22.3188 17.1338C22.587 18.6564 21.5708 20.1083 20.0483 20.377L18.3735 20.6719C16.8509 20.9403 15.3992 19.9239 15.1304 18.4014L14.9497 17.376V18.2002C14.9495 19.7464 13.6962 21 12.1499 21H10.4497C9.76398 20.9999 9.13665 20.7521 8.6499 20.3428C8.16312 20.7521 7.5359 21 6.8501 21H5.1499C3.60373 20.9999 2.35032 19.7464 2.3501 18.2002V5.79983C2.3502 4.25359 3.60366 3.00013 5.1499 3.00002H6.8501C7.53605 3.00002 8.16405 3.24681 8.65088 3.65627C9.13751 3.24737 9.76437 3.00013 10.4497 3.00002H12.1499C12.8053 3.00002 13.4073 3.22633 13.8843 3.60354C14.2574 3.27411 14.7215 3.03818 15.2476 2.94534L16.9224 2.65041ZM5.1499 5.00002C4.70823 5.00013 4.3502 5.35816 4.3501 5.79983V18.2002C4.35032 18.6418 4.7083 18.9999 5.1499 19H6.8501C7.29179 19 7.64968 18.6419 7.6499 18.2002V5.79983C7.6498 5.35809 7.29186 5.00002 6.8501 5.00002H5.1499ZM10.4497 5.00002C10.0081 5.00026 9.65001 5.35824 9.6499 5.79983V18.2002C9.65013 18.6417 10.0082 18.9998 10.4497 19H12.1499C12.5916 19 12.9495 18.6419 12.9497 18.2002V5.97268C12.939 5.86374 12.9331 5.75571 12.9351 5.64846C12.8643 5.27905 12.54 5.00002 12.1499 5.00002H10.4497ZM18.1958 5.26858C18.119 4.83378 17.7049 4.5437 17.27 4.62014L15.5952 4.91506C15.2383 4.97808 14.9793 5.26878 14.9399 5.61135C14.9441 5.67365 14.9497 5.73648 14.9497 5.79983V5.85842L17.1001 18.0537C17.1769 18.4885 17.5911 18.7786 18.0259 18.7022L19.7007 18.4073C20.1357 18.3305 20.4257 17.9155 20.3491 17.4805L18.1958 5.26858Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 24 24"}, "folder": {"content": "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.33984 3C9.14269 3.00008 9.92488 3.25442 10.5742 3.72656L11.8516 4.65527C12.1591 4.87895 12.5299 4.99992 12.9102 5H17.9502C20.0487 5.00011 21.7499 6.70128 21.75 8.7998V17.2002C21.7499 19.2987 20.0487 20.9999 17.9502 21H6.0498C3.95128 20.9999 2.25011 19.2987 2.25 17.2002V6.7998C2.25011 4.70128 3.95128 3.00011 6.0498 3H8.33984ZM4.25 12V17.2002C4.25011 18.1942 5.05585 18.9999 6.0498 19H17.9502C18.9442 18.9999 19.7499 18.1942 19.75 17.2002V12H4.25ZM6.0498 5C5.05585 5.00011 4.25011 5.80585 4.25 6.7998V10H19.75V8.7998C19.7499 7.80585 18.9442 7.00011 17.9502 7H12.9102C12.1073 6.99992 11.3251 6.74558 10.6758 6.27344L9.39844 5.34473C9.09088 5.12105 8.72013 5.00008 8.33984 5H6.0498Z\" fill=\"currentColor\"></path>", "viewBox": "0 0 24 24"}, "clock": {"content": "<path d=\"M12 6C12.5522 6.00004 13 6.44774 13 7V11.793C13 12.1907 12.8418 12.5722 12.5605 12.8535L10.207 15.207C9.81652 15.5975 9.1835 15.5975 8.79297 15.207C8.40244 14.8165 8.40244 14.1835 8.79297 13.793L11 11.5859V7C11 6.44772 11.4477 6 12 6Z\" fill=\"currentColor\"></path> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z\" fill=\"currentColor\"></path>", "viewBox": "0 0 24 24"}, "plugins": {"content": "<g transform=\"translate(0.000778 0)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M12.376 2.05518C18.4591 2.05538 22.2783 6.82128 21.8985 12.2603C21.7544 14.324 20.6238 15.8853 19.0645 16.5229C17.7306 17.0684 16.1995 16.8848 14.9395 15.9243C14.1591 16.5464 13.2588 16.9573 12.3116 17.0366C11.1466 17.1341 10.0097 16.7213 9.09773 15.7739L9.08113 15.7563C9.07425 15.7491 9.06388 15.7379 9.05085 15.7241C9.02445 15.6962 8.98561 15.6557 8.93757 15.605C8.84116 15.5032 8.70599 15.3602 8.55085 15.1968C8.24021 14.8696 7.85024 14.4602 7.53132 14.1274L7.44831 14.0298C7.05864 13.531 7.10087 12.809 7.56648 12.3608L7.67683 12.2534L6.92878 11.4761C6.54597 11.0782 6.55829 10.445 6.95613 10.062C7.35403 9.67906 7.9872 9.69148 8.37019 10.0894L9.11824 10.8667L10.9786 9.07666L10.2296 8.29932C9.84662 7.90148 9.85919 7.26828 10.2569 6.88525C10.6548 6.50227 11.288 6.51379 11.671 6.91162L12.42 7.68994L12.5401 7.57471C13.0393 7.09425 13.8337 7.11114 14.3116 7.61279L15.877 9.25537C16.8081 10.2149 17.1829 11.3673 17.0313 12.5317C16.9429 13.2103 16.6796 13.8534 16.2979 14.4399C16.9772 14.8907 17.7057 14.9184 18.3077 14.6724C19.0833 14.3552 19.8061 13.5132 19.9034 12.1206C20.2082 7.7525 17.2152 4.05537 12.376 4.05518C8.08199 4.05532 4.38274 7.33741 4.09577 11.4468C3.7735 16.0632 7.03203 19.9445 11.9981 19.9448C13.9043 19.9448 15.7663 19.4675 17.046 18.4771C17.4826 18.139 18.1112 18.2192 18.4493 18.6558C18.7872 19.0925 18.7072 19.7201 18.2706 20.0581C16.5276 21.4074 14.1799 21.9448 11.9981 21.9448C5.80403 21.9445 1.70237 17.0108 2.10066 11.3071C2.46675 6.06573 7.11803 2.05532 12.376 2.05518ZM9.49128 13.2847C9.66873 13.471 9.84529 13.6558 10.001 13.8198C10.1568 13.9838 10.293 14.1269 10.3897 14.229C10.438 14.2799 10.4764 14.3211 10.503 14.3491L10.544 14.3921C11.0522 14.9171 11.6029 15.0896 12.1446 15.0444C12.7183 14.9964 13.3778 14.6931 14.004 14.0903C14.639 13.479 14.9746 12.8367 15.0479 12.2739C15.1165 11.7479 14.972 11.1923 14.4366 10.6431L14.4278 10.6353L13.3839 9.53857L9.49128 13.2847Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 24 24"}, "more": {"content": "<path d=\"M5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10Z\" fill=\"currentColor\"></path> <path d=\"M12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z\" fill=\"currentColor\"></path> <path d=\"M19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10Z\" fill=\"currentColor\"></path>", "viewBox": "0 0 24 24"}, "panel": {"content": "<g transform=\"translate(0 -0.000488)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M14.5 2.66699C16.6401 2.66699 18.375 4.40189 18.375 6.54199V13.459C18.3748 15.5989 16.64 17.334 14.5 17.334H5.5C3.36 17.334 1.62518 15.5989 1.625 13.459V6.54199C1.625 4.40189 3.3599 2.66699 5.5 2.66699H14.5ZM8.375 15.584H14.5C15.6735 15.584 16.6248 14.6324 16.625 13.459V6.54199C16.625 5.36839 15.6736 4.41699 14.5 4.41699H8.375V15.584ZM5.5 4.41699C4.3264 4.41699 3.375 5.36839 3.375 6.54199V13.459C3.37518 14.6324 4.3265 15.584 5.5 15.584H6.625V4.41699H5.5Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 20 20"}, "search": {"content": "<g transform=\"translate(-0.104706 -0.06543)\"><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M9.16211 2.37988C12.8659 2.38006 15.8682 5.38303 15.8682 9.08691C15.8681 10.7174 15.2848 12.2108 14.3174 13.373L17.5596 16.6162C17.8193 16.8759 17.8193 17.2969 17.5596 17.5566C17.2998 17.8159 16.8787 17.8162 16.6191 17.5566L13.3691 14.3076C12.2186 15.236 10.7557 15.7929 9.16211 15.793C5.45823 15.793 2.45525 12.7908 2.45508 9.08691C2.45508 5.38292 5.45812 2.37988 9.16211 2.37988ZM9.16211 3.70996C6.19266 3.70996 3.78516 6.11746 3.78516 9.08691C3.78533 12.0562 6.19277 14.4629 9.16211 14.4629C12.1313 14.4627 14.5379 12.0561 14.5381 9.08691C14.5381 6.11757 12.1314 3.71014 9.16211 3.70996Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 20 20"}, "mic": {"content": "<g transform=\"translate(0.000122 -0.083496)\"><path d=\"M3.56774 10.8418C3.90789 10.7042 4.2959 10.8681 4.43395 11.208C5.32473 13.4086 7.48188 14.9598 9.99938 14.96C12.5171 14.9599 14.675 13.4087 15.5658 11.208C15.7038 10.8682 16.0909 10.7043 16.431 10.8418C16.7714 10.9796 16.9358 11.3676 16.7982 11.708C15.7902 14.1978 13.4525 16.008 10.6644 16.2588V18.292C10.6642 18.6591 10.3665 18.957 9.99938 18.957C9.63239 18.9568 9.33452 18.659 9.33434 18.292V16.2588C6.54646 16.0079 4.20952 14.1977 3.20153 11.708C3.06399 11.3678 3.22772 10.9797 3.56774 10.8418Z\" fill=\"currentColor\"></path> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M9.99938 1.20996C12.2075 1.20996 13.9982 2.99994 13.9984 5.20801V8.94434C13.9984 11.1526 12.2076 12.9434 9.99938 12.9434C7.79131 12.9432 6.00133 11.1524 6.00133 8.94434V5.20801C6.00151 3.00005 7.79142 1.21014 9.99938 1.20996ZM9.99938 2.54004C8.52596 2.54021 7.33159 3.73459 7.33141 5.20801V8.94434C7.33141 10.4179 8.52585 11.6131 9.99938 11.6133C11.4731 11.6133 12.6683 10.418 12.6683 8.94434V5.20801C12.6681 3.73448 11.473 2.54004 9.99938 2.54004Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 20 20"}, "arrow": {"content": "<g transform=\"translate(0.000122 -0.103515)\"><path d=\"M9.17607 4.2585C9.63094 3.80374 10.3686 3.80387 10.8235 4.2585L15.262 8.696C15.5216 8.95561 15.5214 9.37671 15.262 9.63643C15.0023 9.89613 14.5813 9.89613 14.3216 9.63643L10.6653 5.98018V15.6247C10.6653 15.9919 10.3674 16.2896 10.0003 16.2898C9.63302 16.2898 9.33525 15.992 9.33525 15.6247V5.9792L5.679 9.63643C5.4193 9.89613 4.99729 9.89613 4.73759 9.63643C4.47857 9.37674 4.47827 8.9555 4.73759 8.696L9.17607 4.2585Z\" fill=\"currentColor\"></path></g>", "viewBox": "0 0 20 20"}, "plus": {"content": "<path d=\"M10.0005 2.66846C10.3675 2.66872 10.6655 2.96639 10.6655 3.3335V9.33545H16.6665C17.0338 9.33545 17.3315 9.63322 17.3315 10.0005C17.3313 10.3675 17.0336 10.6655 16.6665 10.6655H10.6655V16.6665C10.6655 17.0336 10.3675 17.3313 10.0005 17.3315C9.63322 17.3315 9.33545 17.0338 9.33545 16.6665V10.6655H3.3335C2.96639 10.6655 2.66872 10.3675 2.66846 10.0005C2.66846 9.63322 2.96623 9.33545 3.3335 9.33545H9.33545V3.3335C9.33545 2.96623 9.63322 2.66846 10.0005 2.66846Z\" fill=\"currentColor\"></path>", "viewBox": "0 0 20 20"}};
function paintIcons(root=document){root.querySelectorAll("[data-icon]").forEach(el=>{const icon=referenceIcons[el.dataset.icon];el.innerHTML=icon?`<svg class="reference-icon" viewBox="${icon.viewBox}" aria-hidden="true">${icon.content}</svg>`:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[el.dataset.icon]||paths.more}"/></svg>`})}
paintIcons();
const $=s=>document.querySelector(s), modal=$('#modal'), input=$('textarea');
let dashboardReady=false;
let padelAccepted=false;
let invitationShown=false;
let carolineNotificationShown=false;
let slackNotificationTimer=null;
const yesterdaySessions=[
 {id:'fix-x',title:'Fix 48217 · Invitation retry bug',prompt:'Fix the invitation retry bug. A failed invite should be safe to retry without sending duplicates.',result:"Fixed the invitation retry flow. Retries reuse the original invitation and skip any invite that has already been delivered.\n\nTransient failures can be retried, and the UI now makes the invitation status clear."},
 {id:'fix-y',title:'Fix 63104 · Onboarding validation',prompt:'Fix onboarding validation so users can correct invalid fields without losing their progress.',result:"Finished the onboarding validation update. Invalid fields now show inline feedback, valid entries stay in place, and users can continue after correcting the errors.\n\nThe client and server use the same required-field rules."},
 {id:'explore-z',title:'Explore 72590 · Event processing architecture',prompt:'Explore an event processing architecture for our next phase of growth. Compare the options and recommend a starting point.',result:"Completed the architecture exploration. The proposed starting point uses a durable event queue, idempotent consumers, and a dead-letter queue for events that need attention.\n\nThe design notes cover ordering, retries, observability, and how we can move over one event type at a time."},
 {id:'build-w',title:'Build 84623 · Workspace export flow',prompt:'Build the workspace export flow so a user can request an export and download it when it is ready.',result:"Finished the workspace export flow. Users can request an export, track its progress, and download the completed archive.\n\nThe flow includes workspace permission checks, an empty-workspace state, and a way to retry failed exports."}
];
const runningSessions=[
 {id:'architecture-draft',title:'Architecture draft',prompt:'Draft a frontend architecture map for our next-generation eCommerce system. Cover browsing, search, product details, the cart, and checkout. Show the rendering approach, quality requirements, and team ownership for each part of the customer journey.'},
 {id:'bug-97831',title:'Bug 97831 investigation',prompt:'Investigate bug 97831. Review the reported behavior and relevant code, trace the failure, and work toward a reproducible cause. Summarize the evidence and suggest the smallest fix for review.'}
];
let chats=yesterdaySessions.map(session=>({id:session.id,title:session.title,completedYesterday:true,locked:false,running:false,messages:[{role:'user',text:session.prompt},{role:'assistant',text:session.result}]})),active=null;
function startTodaySessions(){
 for(const chat of chats){if(chat.completedYesterday)chat.locked=true}
 for(const session of [...runningSessions].reverse()){
  if(!chats.some(chat=>chat.id===session.id))chats.unshift({id:session.id,title:session.title,pending:true,running:false,messages:[{role:'user',text:session.prompt}]});
 }
}
let queueOrder=0;
const maxRunningSessions=2;
const completionTimers=new Map();
function fillAvailableSlots(){
 let available=maxRunningSessions-chats.filter(chat=>chat.running).length;
 const waiting=chats.filter(chat=>chat.queued&&!chat.paused).sort((a,b)=>a.queueOrder-b.queueOrder);
 for(const chat of waiting){
  if(available<=0)break;
  chat.queued=false;chat.running=true;available--;scheduleSessionCompletion(chat);
 }
}
function scheduleSessionCompletion(chat){
 if(chat.id!=='architecture-draft'||completionTimers.has(chat.id))return;
 completionTimers.set(chat.id,setTimeout(()=>{
  completionTimers.delete(chat.id);
  if(!chat.running)return;
  chat.running=false;chat.ready=true;
  chat.messages.push({role:'assistant',text:'The frontend architecture draft is ready. The map covers the customer journey from opening the webshop to checkout, with rendering strategies, quality requirements, and team ownership.',image:{src:'frontend-architecture-map.png',alt:'Frontend Architecture Map for the Next Gen eCommerce System, showing customer activities, steps, interactivity, quality attributes, rendering strategies, and team ownership.'}});
  fillAvailableSlots();
  if(document.body.classList.contains('session-page'))render();
  else renderHistory();
 },10000));
}
function renderMessage(message){
 const el=document.createElement('div');el.className='message '+message.role;
 const text=document.createElement('div');text.textContent=message.text;el.append(text);
 if(message.image){
  const figure=document.createElement('figure');figure.className='message-artifact';
  const link=document.createElement('a');link.href=message.image.src;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label','Open frontend architecture map at full size');
  const image=document.createElement('img');image.src=message.image.src;image.alt=message.image.alt;image.width=1920;image.height=1080;
  const caption=document.createElement('figcaption');caption.textContent='Frontend Architecture Map · Click to view full size';
  link.append(image);figure.append(link,caption);el.append(figure);
 }
 return el;
}
function startSession(chat){
 chat.paused=false;
 const enqueue=session=>{
  if(session.running||session.queued)return;
  session.queued=true;session.queueOrder=++queueOrder;session.ready=false;
 };
 enqueue(chat);
 for(const definition of runningSessions){
  const session=chats.find(item=>item.id===definition.id);
  if(session?.pending){session.pending=false;enqueue(session)}
 }
 fillAvailableSlots();
}
function focusSession(chat){
 for(const other of chats){
  if(other.id===chat.id||other.completedYesterday)continue;
  clearTimeout(completionTimers.get(other.id));completionTimers.delete(other.id);
  other.running=false;other.queued=false;other.pending=false;other.paused=true;
 }
 chat.paused=false;chat.queued=false;chat.pending=false;chat.ready=false;chat.running=true;
 if(isDashboardSession(chat))dashboardReady=false;
 scheduleSessionCompletion(chat);
}
function renderHistory(){
 $('.history').hidden=chats.length===0;
 const list=$('#chat-list');list.replaceChildren();
 const groups=[['Today',chats.filter(c=>!c.completedYesterday)],['Yesterday',chats.filter(c=>c.completedYesterday)]];
 for(const [label,group] of groups){
  if(!group.length)continue;
  const heading=document.createElement('div');heading.className='recent-group-label';heading.textContent=label;list.append(heading);
  const lockedGroup=label==='Yesterday'&&group.every(chat=>chat.locked);
  if(lockedGroup){
   heading.classList.add('recent-group-locked');
   const badge=document.createElement('span');badge.className='session-lock-label';badge.textContent='Locked';heading.append(badge);
   const note=document.createElement('p');note.id='locked-sessions-note';note.className='session-lock-note';note.textContent='Finished sessions are read-only.';list.append(note);
  }
  for(const c of group){
   const b=document.createElement('button');b.className='nav-item recent-item';b.title=c.title+(c.locked?' · Locked (read-only)':'');b.dataset.session=c.id;
   if(c.locked)b.classList.add('session-locked');
   if(c.locked&&lockedGroup)b.setAttribute('aria-describedby','locked-sessions-note');
   const title=document.createElement('span');title.className='recent-title';title.textContent=c.title;b.append(title);
   b.classList.toggle('selected',c.id===active);
   if(c.running){const spinner=document.createElement('span');spinner.className='running-spinner';spinner.setAttribute('role','status');spinner.setAttribute('aria-label','Session running');b.append(spinner)}
   else if(c.paused){const paused=document.createElement('span');paused.className='queued-status';paused.textContent='Paused';paused.setAttribute('aria-label','Session paused');b.append(paused)}
   else if(c.queued){const queued=document.createElement('span');queued.className='queued-status';queued.textContent='Queued';queued.setAttribute('aria-label','Session queued');b.append(queued)}
   else if(c.completedYesterday){const done=document.createElement('span');done.className='completed-check';done.setAttribute('role','img');done.setAttribute('aria-label',c.locked?'Finished yesterday, locked':'Finished yesterday');done.innerHTML=c.locked?'<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="5" y="8" width="10" height="8" rx="2"/><path d="M7 8V6a3 3 0 0 1 6 0v2M10 11v2"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 10 3.2 3.2L15 6.5"/></svg>';b.append(done)}
   if(c.ready&&!c.paused){const ready=document.createElement('span');ready.className='ready-dot';ready.setAttribute('aria-label','Ready for review');b.append(ready)}
   if(c.unread){const dot=document.createElement('span');dot.className='unread';b.append(dot)}
   b.onclick=()=>openSession(c.id);
   list.append(b);
  }
 }
}

function openSession(id){
 const chat=chats.find(c=>c.id===id);if(!chat)return;
 if(isDashboardSession(chat)){openDashboard();return}
 if(location.hash)history.pushState(null,'',location.pathname);
 active=id;chat.unread=false;render();document.body.classList.remove('sidebar-mobile-open');
 if(id==='architecture-draft')scheduleDistractionReminder(id);
 if(id==='build-w'&&!carolineNotificationShown&&!slackNotificationTimer){
  slackNotificationTimer=setTimeout(()=>{slackNotificationTimer=null;showCarolineNotification()},2000);
 }
}

function dialog(title,content){$('#dialog-title').textContent=title;$('#dialog-content').replaceChildren();if(typeof content==='string'){$('#dialog-content').textContent=content}else{$('#dialog-content').append(content)}modal.showModal()}
function options(items){const box=document.createElement('div');items.forEach(([label,action])=>{const b=document.createElement('button');b.className='option';b.textContent=label;b.onclick=action;box.append(b)});return box}
function newChat(){if(location.hash)history.pushState(null,'',location.pathname);exitPriorities();active=null;document.body.classList.remove('chatting','sidebar-mobile-open');$('#conversation').hidden=true;$('#conversation').replaceChildren();input.value='';resize();$('#attachment').hidden=true;renderHistory();input.focus()}
function render(){const chat=chats.find(c=>c.id===active);if(!chat)return;if(isDashboardSession(chat)){openDashboard(false);return}exitPriorities();document.body.classList.add('chatting','session-page');const header=document.querySelector('header');header.innerHTML='<div class="summary-heading"><button class="icon-button reopen" data-action="sidebar" aria-label="Open sidebar" data-icon="panel"></button><span class="session-title"></span><span class="muted">· Work</span></div>';header.querySelector('.session-title').textContent=chat.title;const area=$('#conversation');area.hidden=false;area.replaceChildren();if(chat.completedYesterday){const completed=document.createElement('p');completed.className='session-completed';completed.textContent=chat.locked?'Yesterday · Finished · Read-only':'Yesterday · Finished';area.append(completed)}if(chat.ready){const completed=document.createElement('p');completed.className='session-completed';completed.textContent='Today · Finished';area.append(completed)}chat.messages.forEach(message=>area.append(renderMessage(message)));if(chat.running){const thinking=document.createElement('div');thinking.className='thinking-indicator';thinking.setAttribute('role','status');thinking.innerHTML='<span class="running-spinner" aria-hidden="true"></span><span>Thinking</span>';area.append(thinking)}else if(chat.paused){const paused=document.createElement('div');paused.className='queued-indicator';paused.setAttribute('role','status');paused.textContent='Paused · Focusing on the activation dashboard.';area.append(paused)}else if(chat.queued){const queued=document.createElement('div');queued.className='queued-indicator';queued.setAttribute('role','status');queued.textContent='Queued · Waiting for one of the two running sessions to finish.';area.append(queued)}setComposerLocked(!!chat.locked);area.scrollTop=area.scrollHeight;$('.history').hidden=false;renderHistory();paintIcons()}
function setComposerLocked(locked){
 $('#composer').classList.toggle('composer-locked',locked);
 input.disabled=locked;
 $('#composer').querySelectorAll('button').forEach(button=>button.disabled=locked);
 if(locked){input.value='';input.placeholder='This session is locked';$('#attachment').hidden=true}
 resize();
}
function resize(){input.style.height='0px';input.style.height=Math.max(38,Math.min(input.scrollHeight,180))+'px';$('.send-button').disabled=input.disabled||!input.value.trim()}
input.addEventListener('input',resize);
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#composer').requestSubmit()}});
$('#composer').addEventListener('submit',e=>{
 e.preventDefault();if(chats.find(c=>c.id===active)?.locked)return;
 const text=input.value.trim();if(!text)return;
 const isNewSession=!active;
 if(isNewSession){startTodaySessions();active=crypto.randomUUID();chats.unshift({id:active,title:text.slice(0,40),messages:[]})}
 const chat=chats.find(c=>c.id===active);
 chat.messages.push({role:'user',text});chat.completedYesterday=false;
 if(isDashboardSession(chat))focusSession(chat);else startSession(chat);
 input.value='';resize();render();
 if(isNewSession)scheduleDistractionReminder(chat.id);
});
const actions={new:newChat,sidebar:()=>{if(matchMedia('(max-width:700px)').matches)document.body.classList.toggle('sidebar-mobile-open');else document.body.classList.toggle('sidebar-closed')},close:()=>modal.close(),model:()=>dialog('ChatGPT',options([['ChatGPT · Local demo',()=>modal.close()]])),login:()=>dialog('Local preview','Account sign-in is not connected in this prototype. You can try the composer and conversation layout without an account.'),signup:()=>actions.login(),attach:()=>$('#file-input').click(),voice:()=>dialog('Voice input','Voice input is not connected in this local layout prototype.'),images:()=>dialog('Images','Image generation is not connected in this prototype.'),plugins:()=>dialog('Plugins','Plugin connections can be added when we build out this interface.'),research:()=>{input.value='Research ';resize();input.focus()},plans:()=>dialog('Plans and pricing','This local prototype has no subscriptions or billing.'),help:()=>dialog('Help','Type a message and press Enter to preview a conversation. Shift + Enter adds a new line. Use New chat to start again.'),about:()=>dialog('About this demo','An independent local recreation of the ChatGPT layout. No OpenAI account or AI service is connected. Demo conversations stay in memory and reset when you reload.'),capabilities:()=>dialog('What can you do?',options([['Try a conversation',()=>{modal.close();input.value='Help me brainstorm a few ideas';resize();input.focus()}],['Explore the layout',()=>{modal.close();actions.sidebar()}]])),settings:()=>dialog('Settings',options([['Toggle light / dark appearance',()=>{document.body.classList.toggle('dark-theme');modal.close()}]])),search:()=>{const box=document.createElement('div'),search=document.createElement('input'),list=document.createElement('div');search.placeholder='Search chats';search.setAttribute('aria-label','Search chats');box.append(search,list);function results(){list.replaceChildren();const matches=chats.filter(c=>c.title.toLowerCase().includes(search.value.toLowerCase()));if(!matches.length)list.textContent='No chats found.';matches.forEach(c=>{const b=document.createElement('button');b.className='option';b.textContent=c.title;b.onclick=()=>{modal.close();openSession(c.id)};list.append(b)})}search.oninput=results;results();dialog('Search chats',box)}};
document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(button)actions[button.dataset.action]?.()});
$('.scrim').onclick=()=>document.body.classList.remove('sidebar-mobile-open');
$('#file-input').onchange=e=>{const file=e.target.files[0];if(file){$('#attachment').textContent=file.name+' · Preview only, not uploaded';$('#attachment').hidden=false}};
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});

actions.library=()=>dialog('Library','Your saved files and images will appear here. This is a local layout preview.');
actions.projects=()=>dialog('Projects','Project navigation is ready to customize in this local preview.');
actions.scheduled=()=>dialog('Scheduled','There are no scheduled tasks connected to this local preview.');
actions.more=()=>dialog('More',options([['Settings',()=>{modal.close();actions.settings()}],['Help',()=>{modal.close();actions.help()}],['About this demo',()=>{modal.close();actions.about()}]]));
actions.temporary=()=>{newChat();dialog('Temporary chat','This demo keeps conversations only until the page is reloaded. No messages are sent to an AI service.')};
actions.model=()=>dialog('Choose model',options([['6 Pro · Demo',()=>modal.close()]]));
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(tab=>tab.setAttribute('aria-selected',String(tab===button)));document.querySelector('h1').textContent=button.dataset.mode==='Work'?'What are you working on, Joe?':'How can I help, Joe?'});
document.querySelectorAll('[data-suggestion]').forEach(button=>button.onclick=()=>{input.value=button.dataset.suggestion;resize();input.focus()});
renderHistory();

actions.priorities=()=>{const suggestions=document.querySelector('.suggestions');suggestions.hidden=!suggestions.hidden;document.querySelector('[data-action="priorities"]').setAttribute('aria-expanded',String(!suggestions.hidden))};

const homeHeader=document.querySelector('header').innerHTML;
const homeModel=document.querySelector('.model-selector').innerHTML;
let prioritiesTimer=null;
let distractionTimer=null;
function exitPriorities(){
 setComposerLocked(false);
 clearTimeout(prioritiesTimer);prioritiesTimer=null;
 document.querySelector("#conversation").removeAttribute("aria-busy");
 if(!document.body.classList.contains('priorities-page')&&!document.body.classList.contains('insurance-page')&&!document.body.classList.contains('session-page'))return;
 document.body.classList.remove('priorities-page','insurance-page','session-page');
 document.querySelector('header').innerHTML=homeHeader;
 document.querySelector('.model-selector').innerHTML=homeModel;
 input.placeholder='Ask Codex';
 document.querySelectorAll('.recent-item').forEach(b=>b.classList.remove('selected'));
 bindModes();
}
function bindModes(){document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-mode]').forEach(tab=>tab.setAttribute('aria-selected',String(tab===button)));document.querySelector('h1').textContent=button.dataset.mode==='Work'?'What are you working on, Joe?':'How can I help, Joe?'})}
function openPriorities(push=true,loading=false){
 exitPriorities();
 if(push&&location.hash!=='#/inbox-summary')history.pushState(null,'','#/inbox-summary');
 active=null;renderHistory();
 document.body.classList.add('chatting','priorities-page');document.body.classList.remove('sidebar-mobile-open');
 document.querySelector('header').innerHTML=`<div class="summary-heading"><button class="icon-button reopen" data-action="sidebar" aria-label="Open sidebar" data-icon="panel"></button><span>Afternoon priorities</span><span class="muted">· &nbsp;Work</span></div><div class="summary-actions"><button class="share-button" data-action="share-preview"><i data-icon="share"></i>Share</button><button class="icon-button" data-action="summary-more" aria-label="More options" data-icon="more"></button><button class="icon-button" data-action="summary-details" aria-label="Conversation details" data-icon="details"></button></div>`;
 const area=document.querySelector('#conversation');area.hidden=false;area.replaceChildren();area.scrollTop=0;
 const showSummary=()=>{area.removeAttribute('aria-busy');area.replaceChildren(document.querySelector('#priorities-template').content.cloneNode(true));const today=chats.filter(chat=>!chat.completedYesterday);area.querySelector('.today-sessions').hidden=!today.length;const list=area.querySelector('.today-sessions ul');list.replaceChildren();for(const chat of today){const item=document.createElement('li');item.textContent=chat.title+' · '+(chat.running?'Running':chat.queued?'Queued':'Ready for review');list.append(item)};if(chats.some(chat=>chat.completedYesterday&&chat.locked))area.querySelector('.yesterday-heading').textContent='Finished yesterday · Read-only';paintIcons(area);prioritiesTimer=null};
 if(loading){
  area.setAttribute('aria-busy','true');
  const state=document.createElement('div');state.className='priorities-loading';state.setAttribute('role','status');
  const caption=document.createElement('p');caption.textContent='Reviewing your sprint and yesterday’s sessions…';
  const thinking=document.createElement('div');thinking.className='thinking-indicator';
  const spinner=document.createElement('span');spinner.className='running-spinner';spinner.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.textContent='Thinking';thinking.append(spinner,label);state.append(caption,thinking);area.append(state);
  prioritiesTimer=setTimeout(showSummary,3000);
 }else showSummary();
 document.querySelector('.model-selector').innerHTML='GPT-6 Astra <span>High</span><i data-icon="chevron"></i>';
 input.placeholder='Work on anything';input.value='';resize();
 document.querySelectorAll('.recent-item').forEach(b=>b.classList.toggle('selected',b.textContent==='Afternoon priorities'));
 paintIcons();
}
paths.share='M12 15V3 M8 7l4-4 4 4 M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7';
paths.copy='M8 8h11v13H5V8h3 M9 5V3h12v13h-2';
paths.refresh='M20 7V3l-3 3a8 8 0 0 0-13 6 M4 17v4l3-3a8 8 0 0 0 13-6 M20 3v5h-5 M4 21v-5h5';
paths.details='M10 6h10 M10 12h10 M10 18h10 M3 4h3v3H3z M3 10h3v3H3z M3 16h3v3H3z';
actions.priorities=()=>openPriorities(true,true);
actions['share-preview']=()=>dialog('Share','This is a local copy of your screenshot. Public sharing is not connected.');
actions['summary-more']=()=>dialog('Afternoon priorities',options([['Back to new chat',()=>{modal.close();newChat()}],['About this demo',()=>{modal.close();actions.about()}]]));
actions['summary-details']=()=>dialog('Conversation details','Afternoon priorities · Work. Recreated from your screenshot of Saturday, 12 September.');
actions['copy-summary']=async()=>{try{await navigator.clipboard.writeText(document.querySelector('.brief-body').innerText);dialog('Copied','The inbox summary has been copied.')}catch{dialog('Copy summary','Select the summary text to copy it.')}};
actions['refresh-summary']=()=>dialog('Saved preview','This summary is copied from your screenshot. Live inbox updates are not connected.');
actions['brief-source']=()=>dialog('Source preview','The original email links are not included in the screenshot. This local copy preserves their appearance.');
window.addEventListener('popstate',()=>{if(location.hash==='#/inbox-summary')openPriorities(false);else if(location.hash==='#/activation-dashboard')openDashboard(false);else newChat()});
if(location.hash==='#/inbox-summary')openPriorities(false);

function isDashboardSession(chat){
 return chat?.id==='activation-dashboard'||chat?.kind==='activation-dashboard';
}
function findDashboardSession(){
 return chats.find(isDashboardSession)||chats.find(chat=>!chat.completedYesterday&&/\bdashboards?\b/i.test(chat.title));
}
function ensureDashboardSession(){
 let chat=findDashboardSession();
 if(!chat){
  startTodaySessions();
  chat={id:'activation-dashboard',running:false,messages:[{role:'user',text:'Check the client activation dashboard changes from the past week. Compare the activation metric definition, filters, and event handling with the previous version. Explain possible causes of the reported drop, separate confirmed findings from hypotheses, and prepare a concise note for Caroline before her 4pm customer call. Do not send the note or deploy changes.'}]};
  chats.unshift(chat);
 }
 chat.kind='activation-dashboard';chat.title='Activation dashboard';
 return chat;
}
function completeDashboardInBackground(){
 const chat=ensureDashboardSession();
 dashboardReady=true;
 chat.running=false;chat.queued=false;chat.pending=false;chat.paused=false;chat.ready=true;
 if(!chat.completedInBackground){chat.completedInBackground=true;chat.resultAfterMessage=chat.messages.length}
 clearTimeout(completionTimers.get(chat.id));completionTimers.delete(chat.id);
 fillAvailableSlots();
 if(active===chat.id)openDashboard(false);
 else if(document.body.classList.contains('session-page'))render();
 else renderHistory();
 return chat;
}
function openDashboard(push=true){
 exitPriorities();
 const chat=ensureDashboardSession();
 if(!chat.ready&&!chat.completedInBackground&&!chat.paused)startSession(chat);
 dashboardReady=!!chat.ready;
 active=chat.id;chat.unread=false;
 if(push&&location.hash!=='#/activation-dashboard')history.pushState(null,'','#/activation-dashboard');
 document.body.classList.add('chatting','insurance-page');document.body.classList.remove('sidebar-mobile-open');
 document.querySelector('header').innerHTML=`<div class="summary-heading"><button class="icon-button reopen" data-action="sidebar" aria-label="Open sidebar" data-icon="panel"></button><span>Activation dashboard</span><span class="muted">· &nbsp;Work</span></div><div class="summary-actions"><button class="share-button" data-action="share-preview"><i data-icon="share"></i>Share</button><button class="icon-button" data-action="summary-more" aria-label="More options" data-icon="more"></button></div>`;
 const area=document.querySelector('#conversation');area.hidden=false;area.replaceChildren();
 const resultIndex=chat.resultAfterMessage??chat.messages.length;
 chat.messages.forEach((message,index)=>{
  area.append(renderMessage(message));
  if(chat.completedInBackground&&index===resultIndex-1)area.append(document.querySelector('#dashboard-review-template').content.cloneNode(true));
 });
 if(chat.running){
  const thinking=document.createElement('div');thinking.className='thinking-indicator';thinking.setAttribute('role','status');
  thinking.innerHTML='<span class="running-spinner" aria-hidden="true"></span><span></span>';
  thinking.lastElementChild.textContent=chat.completedInBackground?'Working on your reply. Other sessions are paused.':'Reviewing the past week’s dashboard changes…';
  area.append(thinking);
 }else if(chat.paused||chat.queued){
  const status=document.createElement('div');status.className='queued-indicator';status.setAttribute('role','status');
  status.textContent=chat.paused?'Paused · Reply to continue this investigation.':'Queued · Waiting for one of the two running sessions to finish.';area.append(status);
 }
 if(!chat.completedInBackground){
  const detour=document.createElement('button');detour.className='detour-card';detour.dataset.action='try-skill';detour.innerHTML='<span class="muted">1:13pm · Spotted on X</span><strong>A new skill for cleaner LLM outputs</strong><span>Try it in a new session →</span>';area.append(detour);
 }
 area.scrollTop=chat.completedInBackground?(chat.running?area.scrollHeight:Math.max(0,area.querySelector('.dashboard-review').offsetTop-area.offsetTop-16)):0;
 document.querySelector('.model-selector').innerHTML='GPT-6 Astra <span>High</span><i data-icon="chevron"></i>';
 input.placeholder='Work on anything';input.value='';resize();renderHistory();paintIcons();
}
actions['revisit-dashboard']=()=>openDashboard();
if(location.hash==='#/activation-dashboard')openDashboard(false);

actions['recent-options']=()=>dialog('Recents',options([['New session',()=>{modal.close();newChat()}]]));


function scheduleDistractionReminder(sessionId){
 if(invitationShown||distractionTimer)return;
 distractionTimer=setTimeout(()=>{
  distractionTimer=null;
  if(!chats.some(chat=>chat.id===sessionId))return;
  invitationShown=true;
  if(findDashboardSession())completeDashboardInBackground();
  showIncomingCall();
 },3000);
}
let bunnyActionTimer=null;
async function showClippy(){
 completeDashboardInBackground();
 clearTimeout(bunnyActionTimer);
 const box=document.createElement('div');box.className='brief-body';
 const image=document.createElement('img');image.src='dave.png';image.alt='Dave';image.width=100;box.append(image);
 const message=document.createElement('p');message.textContent='You’ll need to leave at 3:30 to make padel at 4. Your dashboard findings are ready. Let’s finish that first and save the side ideas for later.';box.append(message);
 const back=document.createElement('button');back.className='pill dark';back.dataset.guide='return-to-dashboard';back.textContent='Review the dashboard findings';back.onclick=()=>{modal.close();openDashboard()};box.append(back);
 dialog('Want to make padel at 4?',box);
}
function showAfternoonPlan(){
 const box=document.createElement('div');box.className='brief-body';box.innerHTML='<p><strong>2:45–3:00</strong> · Review the dashboard findings.</p><p><strong>3:00–3:15</strong> · Check the metric definition and prepare Caroline’s reply.</p><p><strong>Before 3:30pm</strong> · Finish Caroline’s note before leaving, ahead of her 4pm call.</p><p><strong>3:30pm</strong> · Leave for padel.</p><p><strong>4pm</strong> · Play with Theresa and friends.</p><p class="muted">Your side ideas are still in Recents. Pick them up after the important commitment.</p>';
 const back=document.createElement('button');back.className='pill dark';back.textContent='Return to dashboard investigation';back.onclick=()=>{modal.close();openDashboard()};box.append(back);dialog('Your afternoon',box);
}
actions['try-skill']=()=>{newChat();input.value='Try this new skill for cleaner LLM outputs. Compare it with our current prompting approach and suggest a few experiments.';resize();document.querySelector('#composer').requestSubmit()};
actions['review-findings']=()=>{
 const box=document.createElement('div');box.className='brief-body';box.innerHTML='<p><strong>Check before sharing</strong></p><p>Confirm that invited but inactive accounts were added to the denominator. Compare completed activation events using both definitions.</p><p><strong>Draft for Caroline</strong></p><blockquote>Hi Caroline, the initial investigation points to a change in how the dashboard calculates activation, rather than a confirmed decline in completed activations. I’m checking the denominator against the agreed metric definition and validating the underlying events. I’ll have a confirmed explanation before your 4pm call.</blockquote><p class="demo-note">Demo draft only. Nothing has been sent.</p>';
 const done=document.createElement('button');done.className='pill dark';done.textContent='Keep reviewing the dashboard';done.onclick=()=>modal.close();box.append(done);dialog('Findings and draft reply',box);
};
actions['summary-details']=()=>showAfternoonPlan();
actions.about=()=>dialog('About this demo','Joe is a fictional senior developer. Agent work, messages, findings and times are simulated. No messages are sent. Reload the home page to restart the scenario.');

function showCarolineNotification(){
 if(carolineNotificationShown)return;
 carolineNotificationShown=true;
 const toast=document.createElement('aside');toast.className='slack-notification';toast.setAttribute('role','status');toast.setAttribute('aria-label','Simulated Slack notification from Caroline');
 const open=document.createElement('button');open.className='slack-banner-body';open.setAttribute('aria-label','Slack: New message from Caroline. Open dashboard investigation');
 const icon=document.createElement('span');icon.className='slack-banner-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML='<svg viewBox="0 0 40 40"><g fill="#36c5f0"><rect x="5" y="14" width="15" height="7" rx="3.5"/><rect x="13" y="5" width="7" height="7" rx="3.5"/></g><g fill="#2eb67d"><rect x="22" y="5" width="7" height="15" rx="3.5"/><rect x="31" y="13" width="7" height="7" rx="3.5"/></g><g fill="#ecb22e"><rect x="22" y="22" width="15" height="7" rx="3.5"/><rect x="22" y="31" width="7" height="7" rx="3.5"/></g><g fill="#e01e5a"><rect x="13" y="22" width="7" height="15" rx="3.5"/><rect x="4" y="22" width="7" height="7" rx="3.5"/></g></svg>';
 const copy=document.createElement('span');copy.className='slack-banner-copy';
 const title=document.createElement('strong');title.textContent='New message from Caroline';
 const message=document.createElement('span');message.textContent='Hey Joe, client activation dropped on the dashboard. Can you check what changed in the code this week? I need an explanation before the customer call at 4pm.';
 copy.append(title,message);open.append(icon,copy);open.onclick=()=>{toast.remove();openDashboard()};
 const close=document.createElement('button');close.className='slack-banner-dismiss';close.setAttribute('aria-label','Dismiss Slack notification');close.textContent='×';close.onclick=()=>toast.remove();
 toast.append(open,close);document.body.append(toast);
}

const callHandset='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.3 2.8c.5-.5 1.3-.5 1.8 0L10 6c.4.5.4 1.1.1 1.6L8.7 10c1.2 2.3 3 4.1 5.3 5.3l2.4-1.4c.5-.3 1.1-.3 1.6.1l3.2 2.9c.5.5.5 1.3 0 1.8l-1.6 1.7c-.9.9-2.2 1.2-3.4.8C9.8 19.1 4.9 14.2 2.8 7.8c-.4-1.2-.1-2.5.8-3.4z"/></svg>';
const phoneDevice='<svg viewBox="0 0 12 18" aria-hidden="true"><rect x="2" y="1" width="8" height="16" rx="2"/><path d="M5 3h2M5.5 14.5h1"/></svg>';
const endHandset='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.2 11.1C4.5 8.9 8.1 8 12 8s7.5.9 9.8 3.1c.8.8 1.1 1.8.8 2.9l-.6 2c-.2.7-.8 1.1-1.5 1l-3.5-.5c-.7-.1-1.2-.7-1.2-1.4v-2.2a13.6 13.6 0 0 0-7.6 0v2.2c0 .7-.5 1.3-1.2 1.4l-3.5.5c-.7.1-1.3-.3-1.5-1l-.6-2c-.3-1.1 0-2.1.8-2.9Z"/></svg>';
function showIncomingCall(){
 document.querySelectorAll('.mac-notification,.slack-notification').forEach(notification=>notification.remove());
 const call=document.createElement('aside');call.className='mac-notification incoming-call';call.setAttribute('role','dialog');call.setAttribute('aria-label','Incoming call from Theresa, simulated');
 call.innerHTML='<div class="call-person"><span class="call-photo-wrap"><img class="call-avatar" src="theresa.png" alt=""><span class="phone-app-badge">'+phoneDevice+'</span></span><div class="call-person-copy"><strong>Theresa</strong><span class="call-subtitle">'+phoneDevice+'<span>From your iPhone</span></span></div></div><div class="native-call-controls"><button class="native-answer" aria-label="Accept call" title="Accept call">'+callHandset+'</button><button class="native-decline" aria-label="Decline call" title="Decline call">'+endHandset+'<svg class="call-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg></button></div>';
 call.querySelector('.native-decline').onclick=()=>{call.remove();setTimeout(showTheresaMessage,2000)};
 call.querySelector('.native-answer').onclick=()=>{
  call.classList.add('call-connected');call.querySelector('.call-subtitle span').textContent='Call connected';
  const controls=call.querySelector('.native-call-controls');controls.innerHTML='<button class="native-mute" aria-pressed="false">Mute</button><button class="native-decline" aria-label="End call" title="End call">'+endHandset+'</button>';
  controls.querySelector('.native-mute').onclick=e=>{const mute=e.currentTarget,on=mute.getAttribute('aria-pressed')!=='true';mute.setAttribute('aria-pressed',String(on));mute.textContent=on?'Unmute':'Mute'};
  controls.querySelector('.native-decline').onclick=()=>{call.remove();setTimeout(showTheresaMessage,2000)};
 };
 document.body.append(call);
}
function showTheresaMessage(){
 const toast=document.createElement('aside');toast.className='mac-notification messages-notification';toast.setAttribute('role','status');toast.setAttribute('aria-label','Messages notification from Theresa');
 const layout=document.createElement('div');layout.className='imessage-layout';
 const avatar=document.createElement('span');avatar.className='imessage-avatar';avatar.setAttribute('aria-hidden','true');avatar.innerHTML='<img src="theresa.png" alt=""><span class="imessage-badge"><svg viewBox="0 0 24 24"><path d="M12 3c-5.5 0-10 3.6-10 8 0 2.8 1.7 5.2 4.4 6.6L5 21l5-2.2c.6.1 1.3.2 2 .2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg></span>';
 const body=document.createElement('span');body.className='imessage-content';
 const sender=document.createElement('strong');sender.textContent='Theresa';
 const close=document.createElement('button');close.className='slack-banner-dismiss';close.setAttribute('aria-label','Dismiss Theresa’s message');close.textContent='×';close.onclick=()=>toast.remove();
 const message=document.createElement('span');message.className='imessage-preview';message.textContent='hey joe! padel at 4? kate needs 2 more and my yoga got rained off 😅 you in? lmk!';
 const join=document.createElement('button');join.className='notification-action';join.textContent='Reply: I’m in!';join.onclick=()=>{padelAccepted=true;toast.remove();showClippy()};
 body.append(sender,message);layout.append(avatar,body);toast.append(layout,join,close);document.body.append(toast);
}
