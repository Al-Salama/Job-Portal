const countries = [
    { ar: "جزر أولان", en: "Åland Islands" },
    { ar: "ألبانيا", en: "Albania" },
    { ar: "الجزائر", en: "Algeria" },
    { ar: "ساموا الأمريكية", en: "American Samoa" },
    { ar: "أندورا", en: "Andorra" },
    { ar: "أنغولا", en: "Angola" },
    { ar: "أنغويلا", en: "Anguilla" },
    { ar: "أنتاركتيكا", en: "Antarctica" },
    { ar: "أنتيغوا وبربودا", en: "Antigua and Barbuda" },
    { ar: "الأرجنتين", en: "Argentina" },
    { ar: "أرمينيا", en: "Armenia" },
    { ar: "آروبا", en: "Aruba" },
    { ar: "أستراليا", en: "Australia" },
    { ar: "النمسا", en: "Austria" },
    { ar: "أذربيجان", en: "Azerbaijan" },
    { ar: "الباهاما", en: "Bahamas" },
    { ar: "البحرين", en: "Bahrain" },
    { ar: "بنجلاديش", en: "Bangladesh" },
    { ar: "بربادوس", en: "Barbados" },
    { ar: "روسيا البيضاء", en: "Belarus" },
    { ar: "بلجيكا", en: "Belgium" },
    { ar: "بليز", en: "Belize" },
    { ar: "بنين", en: "Benin" },
    { ar: "برمودا", en: "Bermuda" },
    { ar: "بوتان", en: "Bhutan" },
    { ar: "بوليفيا", en: "Bolivia" },
    { ar: "هولندا الكاريبية", en: "Caribbean Netherlands" },
    { ar: "البوسنة والهرسك", en: "Bosnia and Herzegovina" },
    { ar: "بتسوانا", en: "Botswana" },
    { ar: "جزيرة بوفيه", en: "Bouvet Island" },
    { ar: "البرازيل", en: "Brazil" },
    { ar: "الإقليم البريطاني في المحيط الهندي", en: "British Indian Ocean Territory" },
    { ar: "بروناي", en: "Brunei" },
    { ar: "بلغاريا", en: "Bulgaria" },
    { ar: "بوركينا فاسو", en: "Burkina Faso" },
    { ar: "بوروندي", en: "Burundi" },
    { ar: "كمبوديا", en: "Cambodia" },
    { ar: "الكاميرون", en: "Cameroon" },
    { ar: "كندا", en: "Canada" },
    { ar: "الرأس الأخضر", en: "Cape Verde" },
    { ar: "جزر الكايمن", en: "Cayman Islands" },
    { ar: "جمهورية أفريقيا الوسطى", en: "Central African Republic" },
    { ar: "تشاد", en: "Chad" },
    { ar: "شيلي", en: "Chile" },
    { ar: "الصين", en: "China" },
    { ar: "جزيرة الكريسماس", en: "Christmas Island" },
    { ar: "جزر كوكوس", en: "Cocos [Keeling] Islands" },
    { ar: "كولومبيا", en: "Colombia" },
    { ar: "جزر القمر", en: "Comoros" },
    { ar: "الكونغو - برازافيل", en: "Congo [Republic]" },
    { ar: "الكونغو - كينشاسا", en: "Congo [DRC]" },
    { ar: "جزر كوك", en: "Cook Islands" },
    { ar: "كوستاريكا", en: "Costa Rica" },
    { ar: "ساحل العاج", en: "Côte d’Ivoire" },
    { ar: "كرواتيا", en: "Croatia" },
    { ar: "كوبا", en: "Cuba" },
    { ar: "كوراساو", en: "Curaçao" },
    { ar: "قبرص", en: "Cyprus" },
    { ar: "جمهورية التشيك", en: "Czech Republic" },
    { ar: "الدانمرك", en: "Denmark" },
    { ar: "جيبوتي", en: "Djibouti" },
    { ar: "دومينيكا", en: "Dominica" },
    { ar: "جمهورية الدومينيك", en: "Dominican Republic" },
    { ar: "الإكوادور", en: "Ecuador" },
    { ar: "مصر", en: "Egypt" },
    { ar: "السلفادور", en: "El Salvador" },
    { ar: "غينيا الإستوائية", en: "Equatorial Guinea" },
    { ar: "أريتريا", en: "Eritrea" },
    { ar: "أستونيا", en: "Estonia" },
    { ar: "إثيوبيا", en: "Ethiopia" },
    { ar: "جزر فوكلاند", en: "Falkland Islands [Islas Malvinas]" },
    { ar: "جزر فارو", en: "Faroe Islands" },
    { ar: "فيجي", en: "Fiji" },
    { ar: "فنلندا", en: "Finland" },
    { ar: "فرنسا", en: "France" },
    { ar: "غويانا الفرنسية", en: "French Guiana" },
    { ar: "بولينيزيا الفرنسية", en: "French Polynesia" },
    { ar: "المقاطعات الجنوبية الفرنسية", en: "French Southern Territories" },
    { ar: "الجابون", en: "Gabon" },
    { ar: "غامبيا", en: "Gambia" },
    { ar: "جورجيا", en: "Georgia" },
    { ar: "ألمانيا", en: "Germany" },
    { ar: "غانا", en: "Ghana" },
    { ar: "جبل طارق", en: "Gibraltar" },
    { ar: "اليونان", en: "Greece" },
    { ar: "غرينلاند", en: "Greenland" },
    { ar: "غرينادا", en: "Grenada" },
    { ar: "جوادلوب", en: "Guadeloupe" },
    { ar: "غوام", en: "Guam" },
    { ar: "غواتيمالا", en: "Guatemala" },
    { ar: "غيرنزي", en: "Guernsey" },
    { ar: "غينيا", en: "Guinea" },
    { ar: "غينيا بيساو", en: "Guinea-Bissau" },
    { ar: "غيانا", en: "Guyana" },
    { ar: "هايتي", en: "Haiti" },
    { ar: "جزيرة هيرد وجزر ماكدونالد", en: "Heard Island and McDonald Islands" },
    { ar: "الفاتيكان", en: "Vatican City" },
    { ar: "هندوراس", en: "Honduras" },
    { ar: "هونغ كونغ", en: "Hong Kong" },
    { ar: "هنغاريا", en: "Hungary" },
    { ar: "أيسلندا", en: "Iceland" },
    { ar: "الهند", en: "India" },
    { ar: "أندونيسيا", en: "Indonesia" },
    { ar: "ایران", en: "Iran" },
    { ar: "العراق", en: "Iraq" },
    { ar: "أيرلندا", en: "Ireland" },
    { ar: "جزيرة مان", en: "Isle of Man" },
    { ar: "إسرائيل", en: "Israel" },
    { ar: "إيطاليا", en: "Italy" },
    { ar: "جامايكا", en: "Jamaica" },
    { ar: "اليابان", en: "Japan" },
    { ar: "جيرسي", en: "Jersey" },
    { ar: "الأردن", en: "Jordan" },
    { ar: "كازاخستان", en: "Kazakhstan" },
    { ar: "كينيا", en: "Kenya" },
    { ar: "كيريباتي", en: "Kiribati" },
    { ar: "كوريا الشمالية", en: "North Korea" },
    { ar: "كوريا الجنوبية", en: "South Korea" },
    { ar: "الكويت", en: "Kuwait" },
    { ar: "قرغيزستان", en: "Kyrgyzstan" },
    { ar: "لاوس", en: "Laos" },
    { ar: "لاتفيا", en: "Latvia" },
    { ar: "لبنان", en: "Lebanon" },
    { ar: "ليسوتو", en: "Lesotho" },
    { ar: "ليبيريا", en: "Liberia" },
    { ar: "ليبيا", en: "Libya" },
    { ar: "ليختنشتاين", en: "Liechtenstein" },
    { ar: "ليتوانيا", en: "Lithuania" },
    { ar: "لوكسمبورغ", en: "Luxembourg" },
    { ar: "مكاو", en: "Macau" },
    { ar: "مقدونيا", en: "Macedonia [FYROM]" },
    { ar: "مدغشقر", en: "Madagascar" },
    { ar: "ملاوي", en: "Malawi" },
    { ar: "ماليزيا", en: "Malaysia" },
    { ar: "جزر المالديف", en: "Maldives" },
    { ar: "مالي", en: "Mali" },
    { ar: "مالطا", en: "Malta" },
    { ar: "جزر المارشال", en: "Marshall Islands" },
    { ar: "مارتينيك", en: "Martinique" },
    { ar: "موريتانيا", en: "Mauritania" },
    { ar: "موريشيوس", en: "Mauritius" },
    { ar: "مايوت", en: "Mayotte" },
    { ar: "المكسيك", en: "Mexico" },
    { ar: "ميكرونيزيا", en: "Micronesia" },
    { ar: "مولدافيا", en: "Moldova" },
    { ar: "موناكو", en: "Monaco" },
    { ar: "منغوليا", en: "Mongolia" },
    { ar: "الجبل الأسود", en: "Montenegro" },
    { ar: "مونتسرات", en: "Montserrat" },
    { ar: "المغرب", en: "Morocco" },
    { ar: "موزمبيق", en: "Mozambique" },
    { ar: "ميانمار -بورما", en: "Myanmar [Burma]" },
    { ar: "ناميبيا", en: "Namibia" },
    { ar: "ناورو", en: "Nauru" },
    { ar: "نيبال", en: "Nepal" },
    { ar: "هولندا", en: "Netherlands" },
    { ar: "كاليدونيا الجديدة", en: "New Caledonia" },
    { ar: "نيوزيلاندا", en: "New Zealand" },
    { ar: "نيكاراغوا", en: "Nicaragua" },
    { ar: "النيجر", en: "Niger" },
    { ar: "نيجيريا", en: "Nigeria" },
    { ar: "نيوي", en: "Niue" },
    { ar: "جزيرة نورفوك", en: "Norfolk Island" },
    { ar: "جزر ماريانا الشمالية", en: "Northern Mariana Islands" },
    { ar: "النرويج", en: "Norway" },
    { ar: "عُمان", en: "Oman" },
    { ar: "باكستان", en: "Pakistan" },
    { ar: "بالاو", en: "Palau" },
    { ar: "فلسطين", en: "Palestine" },
    { ar: "بنما", en: "Panama" },
    { ar: "بابوا غينيا الجديدة", en: "Papua New Guinea" },
    { ar: "باراغواي", en: "Paraguay" },
    { ar: "بيرو", en: "Peru" },
    { ar: "الفيلبين", en: "Philippines" },
    { ar: "جزر بيتكيرن", en: "Pitcairn Islands" },
    { ar: "بولندا", en: "Poland" },
    { ar: "البرتغال", en: "Portugal" },
    { ar: "بورتوريكو", en: "Puerto Rico" },
    { ar: "قطر", en: "Qatar" },
    { ar: "روينيون", en: "Réunion" },
    { ar: "رومانيا", en: "Romania" },
    { ar: "روسيا", en: "Russia" },
    { ar: "رواندا", en: "Rwanda" },
    { ar: "سان بارتليمي", en: "Saint Barthélemy" },
    { ar: "سانت هيلنا", en: "Saint Helena" },
    { ar: "سانت كيتس ونيفيس", en: "Saint Kitts and Nevis" },
    { ar: "سانت لوسيا", en: "Saint Lucia" },
    { ar: "سانت مارتن", en: "Saint Martin" },
    { ar: "سانت بيير وميكولون", en: "Saint Pierre and Miquelon" },
    { ar: "سانت فنسنت وغرنادين", en: "Saint Vincent and the Grenadines" },
    { ar: "ساموا", en: "Samoa" },
    { ar: "سان مارينو", en: "San Marino" },
    { ar: "ساو تومي وبرينسيبي", en: "São Tomé and Príncipe" },
    { ar: "المملكة العربية السعودية", en: "Saudi Arabia" },
    { ar: "السنغال", en: "Senegal" },
    { ar: "صربيا", en: "Serbia" },
    { ar: "سيشل", en: "Seychelles" },
    { ar: "سيراليون", en: "Sierra Leone" },
    { ar: "سنغافورة", en: "Singapore" },
    { ar: "سينت مارتن", en: "Sint Maarten" },
    { ar: "سلوفاكيا", en: "Slovakia" },
    { ar: "سلوفينيا", en: "Slovenia" },
    { ar: "جزر سليمان", en: "Solomon Islands" },
    { ar: "الصومال", en: "Somalia" },
    { ar: "جنوب أفريقيا", en: "South Africa" },
    { ar: "جورجيا الجنوبية وجزر ساندويتش الجنوبية", en: "South Georgia and the South Sandwich Islands" },
    { ar: "جنوب السودان", en: "South Sudan" },
    { ar: "إسبانيا", en: "Spain" },
    { ar: "سريلانكا", en: "Sri Lanka" },
    { ar: "السودان", en: "Sudan" },
    { ar: "سورينام", en: "Suriname" },
    { ar: "سفالبارد وجان مايان", en: "Svalbard and Jan Mayen" },
    { ar: "سوازيلاند", en: "Swaziland" },
    { ar: "السويد", en: "Sweden" },
    { ar: "سويسرا", en: "Switzerland" },
    { ar: "سوريا", en: "Syria" },
    { ar: "تايوان", en: "Taiwan" },
    { ar: "طاجكستان", en: "Tajikistan" },
    { ar: "تانزانيا", en: "Tanzania" },
    { ar: "تايلند", en: "Thailand" },
    { ar: "تيمور الشرقية", en: "Timor-Leste" },
    { ar: "توجو", en: "Togo" },
    { ar: "توكيلو", en: "Tokelau" },
    { ar: "تونغا", en: "Tonga" },
    { ar: "ترينيداد وتوباغو", en: "Trinidad and Tobago" },
    { ar: "تونس", en: "Tunisia" },
    { ar: "تركيا", en: "Turkey" },
    { ar: "تركمانستان", en: "Turkmenistan" },
    { ar: "جزر الترك وجايكوس", en: "Turks and Caicos Islands" },
    { ar: "توفالو", en: "Tuvalu" },
    { ar: "أوغندا", en: "Uganda" },
    { ar: "أوكرانيا", en: "Ukraine" },
    { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" },
    { ar: "المملكة المتحدة", en: "United Kingdom" },
    { ar: "الولايات المتحدة", en: "United States" },
    { ar: "جزر الولايات المتحدة البعيدة الصغيرة", en: "U.S. Outlying Islands" },
    { ar: "أورغواي", en: "Uruguay" },
    { ar: "أوزبكستان", en: "Uzbekistan" },
    { ar: "فانواتو", en: "Vanuatu" },
    { ar: "فنزويلا", en: "Venezuela" },
    { ar: "فيتنام", en: "Vietnam" },
    { ar: "جزر فرجين البريطانية", en: "British Virgin Islands" },
    { ar: "جزر فرجين الأمريكية", en: "U.S. Virgin Islands" },
    { ar: "جزر والس وفوتونا", en: "Wallis and Futuna" },
    { ar: "الصحراء الغربية", en: "Western Sahara" },
    { ar: "اليمن", en: "Yemen" },
    { ar: "زامبيا", en: "Zambia" },
    { ar: "زيمبابوي", en: "Zimbabwe" }
]

countries.sort((a, b) => {
    if (a.ar >= b.ar) {
        return 1;
    } else {
        return -1
    }
})

export default countries;