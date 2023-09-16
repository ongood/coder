package randtz

import (
	"math/rand"
	"sync"
	"testing"
	"time"
)

var (
	randTZName     string
	randTZNameOnce sync.Once
)

// Name returns a random timezone name from the list of all
// timezones known to PostgreSQL.
func Name(t testing.TB) string {
	t.Helper()

	randTZNameOnce.Do(func() {
		// nolint: gosec // not used for cryptography
		rnd := rand.New(rand.NewSource(time.Now().Unix()))
		idx := rnd.Intn(len(tznames))
		randTZName = tznames[idx]
		t.Logf("Random db timezone is %q\nIf you need a specific timezone, use dbtestutil.WithTimezone()", randTZName)
	})

	return randTZName
}

// tznames is a list of all timezone names known to postgresql.
// The below list was generated with the query
// select name from pg_timezone_names order by name asc;
var tznames = []string{
	"Africa/Abidjan",
	"Africa/Accra",
	"Africa/Addis_Ababa",
	"Africa/Algiers",
	"Africa/Asmara",
	"Africa/Asmera",
	"Africa/Bamako",
	"Africa/Bangui",
	"Africa/Banjul",
	"Africa/Bissau",
	"Africa/Blantyre",
	"Africa/Brazzaville",
	"Africa/Bujumbura",
	"Africa/Cairo",
	"Africa/Casablanca",
	"Africa/Ceuta",
	"Africa/Conakry",
	"Africa/Dakar",
	"Africa/Dar_es_Salaam",
	"Africa/Djibouti",
	"Africa/Douala",
	"Africa/El_Aaiun",
	"Africa/Freetown",
	"Africa/Gaborone",
	"Africa/Harare",
	"Africa/Johannesburg",
	"Africa/Juba",
	"Africa/Kampala",
	"Africa/Khartoum",
	"Africa/Kigali",
	"Africa/Kinshasa",
	"Africa/Lagos",
	"Africa/Libreville",
	"Africa/Lome",
	"Africa/Luanda",
	"Africa/Lubumbashi",
	"Africa/Lusaka",
	"Africa/Malabo",
	"Africa/Maputo",
	"Africa/Maseru",
	"Africa/Mbabane",
	"Africa/Mogadishu",
	"Africa/Monrovia",
	"Africa/Nairobi",
	"Africa/Ndjamena",
	"Africa/Niamey",
	"Africa/Nouakchott",
	"Africa/Ouagadougou",
	"Africa/Porto-Novo",
	"Africa/Sao_Tome",
	"Africa/Timbuktu",
	"Africa/Tripoli",
	"Africa/Tunis",
	"Africa/Windhoek",
	"America/Adak",
	"America/Anchorage",
	"America/Anguilla",
	"America/Antigua",
	"America/Araguaina",
	"America/Argentina/Buenos_Aires",
	"America/Argentina/Catamarca",
	"America/Argentina/ComodRivadavia",
	"America/Argentina/Cordoba",
	"America/Argentina/Jujuy",
	"America/Argentina/La_Rioja",
	"America/Argentina/Mendoza",
	"America/Argentina/Rio_Gallegos",
	"America/Argentina/Salta",
	"America/Argentina/San_Juan",
	"America/Argentina/San_Luis",
	"America/Argentina/Tucuman",
	"America/Argentina/Ushuaia",
	"America/Aruba",
	"America/Asuncion",
	"America/Atikokan",
	"America/Atka",
	"America/Bahia",
	"America/Bahia_Banderas",
	"America/Barbados",
	"America/Belem",
	"America/Belize",
	"America/Blanc-Sablon",
	"America/Boa_Vista",
	"America/Bogota",
	"America/Boise",
	"America/Buenos_Aires",
	"America/Cambridge_Bay",
	"America/Campo_Grande",
	"America/Cancun",
	"America/Caracas",
	"America/Catamarca",
	"America/Cayenne",
	"America/Cayman",
	"America/Chicago",
	"America/Chihuahua",
	"America/Ciudad_Juarez",
	"America/Coral_Harbor",
	"America/Cordoba",
	"America/Costa_Rica",
	"America/Creston",
	"America/Cuiaba",
	"America/Curacao",
	"America/Danmarkshavn",
	"America/Dawson",
	"America/Dawson_Creek",
	"America/Denver",
	"America/Detroit",
	"America/Dominica",
	"America/Edmonton",
	"America/Eirunepe",
	"America/El_Salvador",
	"America/Ensenada",
	"America/Fortaleza",
	"America/Fort_Nelson",
	"America/Fort_Wayne",
	"America/Glace_Bay",
	"America/Godthab",
	"America/Goose_Bay",
	"America/Grand_Turk",
	"America/Grenada",
	"America/Guadeloupe",
	"America/Guatemala",
	"America/Guayaquil",
	"America/Guyana",
	"America/Halifax",
	"America/Havana",
	"America/Hermosillo",
	"America/Indiana/Indianapolis",
	"America/Indiana/Knox",
	"America/Indiana/Marengo",
	"America/Indiana/Petersburg",
	"America/Indianapolis",
	"America/Indiana/Tell_City",
	"America/Indiana/Vevay",
	"America/Indiana/Vincennes",
	"America/Indiana/Winamac",
	"America/Inuvik",
	"America/Iqaluit",
	"America/Jamaica",
	"America/Jujuy",
	"America/Juneau",
	"America/Kentucky/Louisville",
	"America/Kentucky/Monticello",
	"America/Knox_IN",
	"America/Kralendijk",
	"America/La_Paz",
	"America/Lima",
	"America/Los_Angeles",
	"America/Louisville",
	"America/Lower_Princes",
	"America/Maceio",
	"America/Managua",
	"America/Manaus",
	"America/Marigot",
	"America/Martinique",
	"America/Matamoros",
	"America/Mazatlan",
	"America/Mendoza",
	"America/Menominee",
	"America/Merida",
	"America/Metlakatla",
	"America/Mexico_City",
	"America/Miquelon",
	"America/Moncton",
	"America/Monterrey",
	"America/Montevideo",
	"America/Montreal",
	"America/Montserrat",
	"America/Nassau",
	"America/New_York",
	"America/Nipigon",
	"America/Nome",
	"America/Noronha",
	"America/North_Dakota/Beulah",
	"America/North_Dakota/Center",
	"America/North_Dakota/New_Salem",
	"America/Nuuk",
	"America/Ojinaga",
	"America/Panama",
	"America/Pangnirtung",
	"America/Paramaribo",
	"America/Phoenix",
	"America/Port-au-Prince",
	"America/Porto_Acre",
	"America/Port_of_Spain",
	"America/Porto_Velho",
	"America/Puerto_Rico",
	"America/Punta_Arenas",
	"America/Rainy_River",
	"America/Rankin_Inlet",
	"America/Recife",
	"America/Regina",
	"America/Resolute",
	"America/Rio_Branco",
	"America/Rosario",
	"America/Santa_Isabel",
	"America/Santarem",
	"America/Santiago",
	"America/Santo_Domingo",
	"America/Sao_Paulo",
	"America/Scoresbysund",
	"America/Shiprock",
	"America/Sitka",
	"America/St_Barthelemy",
	"America/St_Johns",
	"America/St_Kitts",
	"America/St_Lucia",
	"America/St_Thomas",
	"America/St_Vincent",
	"America/Swift_Current",
	"America/Tegucigalpa",
	"America/Thule",
	"America/Thunder_Bay",
	"America/Tijuana",
	"America/Toronto",
	"America/Tortola",
	"America/Vancouver",
	"America/Virgin",
	"America/Whitehorse",
	"America/Winnipeg",
	"America/Yakutat",
	"America/Yellowknife",
	"Antarctica/Casey",
	"Antarctica/Davis",
	"Antarctica/DumontDUrville",
	"Antarctica/Macquarie",
	"Antarctica/Mawson",
	"Antarctica/McMurdo",
	"Antarctica/Palmer",
	"Antarctica/Rothera",
	"Antarctica/South_Pole",
	"Antarctica/Syowa",
	"Antarctica/Troll",
	"Antarctica/Vostok",
	"Arctic/Longyearbyen",
	"Asia/Aden",
	"Asia/Almaty",
	"Asia/Amman",
	"Asia/Anadyr",
	"Asia/Aqtau",
	"Asia/Aqtobe",
	"Asia/Ashgabat",
	"Asia/Ashkhabad",
	"Asia/Atyrau",
	"Asia/Baghdad",
	"Asia/Bahrain",
	"Asia/Baku",
	"Asia/Bangkok",
	"Asia/Barnaul",
	"Asia/Beirut",
	"Asia/Bishkek",
	"Asia/Brunei",
	"Asia/Calcutta",
	"Asia/Chita",
	"Asia/Choibalsan",
	"Asia/Chongqing",
	"Asia/Chungking",
	"Asia/Colombo",
	"Asia/Dacca",
	"Asia/Damascus",
	"Asia/Dhaka",
	"Asia/Dili",
	"Asia/Dubai",
	"Asia/Dushanbe",
	"Asia/Famagusta",
	"Asia/Gaza",
	"Asia/Harbin",
	"Asia/Hebron",
	"Asia/Ho_Chi_Minh",
	"Asia/Hong_Kong",
	"Asia/Hovd",
	"Asia/Irkutsk",
	"Asia/Istanbul",
	"Asia/Jakarta",
	"Asia/Jayapura",
	"Asia/Jerusalem",
	"Asia/Kabul",
	"Asia/Kamchatka",
	"Asia/Karachi",
	"Asia/Kashgar",
	"Asia/Kathmandu",
	"Asia/Katmandu",
	"Asia/Khandyga",
	"Asia/Kolkata",
	"Asia/Krasnoyarsk",
	"Asia/Kuala_Lumpur",
	"Asia/Kuching",
	"Asia/Kuwait",
	"Asia/Macao",
	"Asia/Macau",
	"Asia/Magadan",
	"Asia/Makassar",
	"Asia/Manila",
	"Asia/Muscat",
	"Asia/Nicosia",
	"Asia/Novokuznetsk",
	"Asia/Novosibirsk",
	"Asia/Omsk",
	"Asia/Oral",
	"Asia/Phnom_Penh",
	"Asia/Pontianak",
	"Asia/Pyongyang",
	"Asia/Qatar",
	"Asia/Qostanay",
	"Asia/Qyzylorda",
	"Asia/Rangoon",
	"Asia/Riyadh",
	"Asia/Saigon",
	"Asia/Sakhalin",
	"Asia/Samarkand",
	"Asia/Seoul",
	"Asia/Shanghai",
	"Asia/Singapore",
	"Asia/Srednekolymsk",
	"Asia/Taipei",
	"Asia/Tashkent",
	"Asia/Tbilisi",
	"Asia/Tehran",
	"Asia/Tel_Aviv",
	"Asia/Thimbu",
	"Asia/Thimphu",
	"Asia/Tokyo",
	"Asia/Tomsk",
	"Asia/Ujung_Pandang",
	"Asia/Ulaanbaatar",
	"Asia/Ulan_Bator",
	"Asia/Urumqi",
	"Asia/Ust-Nera",
	"Asia/Vientiane",
	"Asia/Vladivostok",
	"Asia/Yakutsk",
	"Asia/Yangon",
	"Asia/Yekaterinburg",
	"Asia/Yerevan",
	"Atlantic/Azores",
	"Atlantic/Bermuda",
	"Atlantic/Canary",
	"Atlantic/Cape_Verde",
	"Atlantic/Faeroe",
	"Atlantic/Faroe",
	"Atlantic/Jan_Mayen",
	"Atlantic/Madeira",
	"Atlantic/Reykjavik",
	"Atlantic/South_Georgia",
	"Atlantic/Stanley",
	"Atlantic/St_Helena",
	"Australia/ACT",
	"Australia/Adelaide",
	"Australia/Brisbane",
	"Australia/Broken_Hill",
	"Australia/Canberra",
	"Australia/Currie",
	"Australia/Darwin",
	"Australia/Eucla",
	"Australia/Hobart",
	"Australia/LHI",
	"Australia/Lindeman",
	"Australia/Lord_Howe",
	"Australia/Melbourne",
	"Australia/North",
	"Australia/NSW",
	"Australia/Perth",
	"Australia/Queensland",
	"Australia/South",
	"Australia/Sydney",
	"Australia/Tasmania",
	"Australia/Victoria",
	"Australia/West",
	"Australia/Yancowinna",
	"Brazil/Acre",
	"Brazil/DeNoronha",
	"Brazil/East",
	"Brazil/West",
	"Canada/Atlantic",
	"Canada/Central",
	"Canada/Eastern",
	"Canada/Mountain",
	"Canada/Newfoundland",
	"Canada/Pacific",
	"Canada/Saskatchewan",
	"Canada/Yukon",
	"CET",
	"Chile/Continental",
	"Chile/EasterIsland",
	"CST6CDT",
	"Cuba",
	"EET",
	"Egypt",
	"Eire",
	"EST",
	"EST5EDT",
	"Etc/GMT",
	"Etc/GMT+0",
	"Etc/GMT-0",
	"Etc/GMT0",
	"Etc/GMT+1",
	"Etc/GMT-1",
	"Etc/GMT+10",
	"Etc/GMT-10",
	"Etc/GMT+11",
	"Etc/GMT-11",
	"Etc/GMT+12",
	"Etc/GMT-12",
	"Etc/GMT-13",
	"Etc/GMT-14",
	"Etc/GMT+2",
	"Etc/GMT-2",
	"Etc/GMT+3",
	"Etc/GMT-3",
	"Etc/GMT+4",
	"Etc/GMT-4",
	"Etc/GMT+5",
	"Etc/GMT-5",
	"Etc/GMT+6",
	"Etc/GMT-6",
	"Etc/GMT+7",
	"Etc/GMT-7",
	"Etc/GMT+8",
	"Etc/GMT-8",
	"Etc/GMT+9",
	"Etc/GMT-9",
	"Etc/Greenwich",
	"Etc/UCT",
	"Etc/Universal",
	"Etc/UTC",
	"Etc/Zulu",
	"Europe/Amsterdam",
	"Europe/Andorra",
	"Europe/Astrakhan",
	"Europe/Athens",
	"Europe/Belfast",
	"Europe/Belgrade",
	"Europe/Berlin",
	"Europe/Bratislava",
	"Europe/Brussels",
	"Europe/Bucharest",
	"Europe/Budapest",
	"Europe/Busingen",
	"Europe/Chisinau",
	"Europe/Copenhagen",
	"Europe/Dublin",
	"Europe/Gibraltar",
	"Europe/Guernsey",
	"Europe/Helsinki",
	"Europe/Isle_of_Man",
	"Europe/Istanbul",
	"Europe/Jersey",
	"Europe/Kaliningrad",
	"Europe/Kiev",
	"Europe/Kirov",
	"Europe/Lisbon",
	"Europe/Ljubljana",
	"Europe/London",
	"Europe/Luxembourg",
	"Europe/Madrid",
	"Europe/Malta",
	"Europe/Mariehamn",
	"Europe/Minsk",
	"Europe/Monaco",
	"Europe/Moscow",
	"Europe/Nicosia",
	"Europe/Oslo",
	"Europe/Paris",
	"Europe/Podgorica",
	"Europe/Prague",
	"Europe/Riga",
	"Europe/Rome",
	"Europe/Samara",
	"Europe/San_Marino",
	"Europe/Sarajevo",
	"Europe/Saratov",
	"Europe/Simferopol",
	"Europe/Skopje",
	"Europe/Sofia",
	"Europe/Stockholm",
	"Europe/Tallinn",
	"Europe/Tirane",
	"Europe/Tiraspol",
	"Europe/Ulyanovsk",
	"Europe/Uzhgorod",
	"Europe/Vaduz",
	"Europe/Vatican",
	"Europe/Vienna",
	"Europe/Vilnius",
	"Europe/Volgograd",
	"Europe/Warsaw",
	"Europe/Zagreb",
	"Europe/Zaporozhye",
	"Europe/Zurich",
	"Factory",
	"GB",
	"GB-Eire",
	"GMT",
	"GMT+0",
	"GMT-0",
	"GMT0",
	"Greenwich",
	"Hongkong",
	"HST",
	"Iceland",
	"Indian/Antananarivo",
	"Indian/Chagos",
	"Indian/Christmas",
	"Indian/Cocos",
	"Indian/Comoro",
	"Indian/Kerguelen",
	"Indian/Mahe",
	"Indian/Maldives",
	"Indian/Mauritius",
	"Indian/Mayotte",
	"Indian/Reunion",
	"Iran",
	"Israel",
	"Jamaica",
	"Japan",
	"Kwajalein",
	"Libya",
	"localtime",
	"MET",
	"Mexico/BajaNorte",
	"Mexico/BajaSur",
	"Mexico/General",
	"MST",
	"MST7MDT",
	"Navajo",
	"NZ",
	"NZ-CHAT",
	"Pacific/Apia",
	"Pacific/Auckland",
	"Pacific/Bougainville",
	"Pacific/Chatham",
	"Pacific/Chuuk",
	"Pacific/Easter",
	"Pacific/Efate",
	"Pacific/Enderbury",
	"Pacific/Fakaofo",
	"Pacific/Fiji",
	"Pacific/Funafuti",
	"Pacific/Galapagos",
	"Pacific/Gambier",
	"Pacific/Guadalcanal",
	"Pacific/Guam",
	"Pacific/Honolulu",
	"Pacific/Johnston",
	"Pacific/Kiritimati",
	"Pacific/Kosrae",
	"Pacific/Kwajalein",
	"Pacific/Majuro",
	"Pacific/Marquesas",
	"Pacific/Midway",
	"Pacific/Nauru",
	"Pacific/Niue",
	"Pacific/Norfolk",
	"Pacific/Noumea",
	"Pacific/Pago_Pago",
	"Pacific/Palau",
	"Pacific/Pitcairn",
	"Pacific/Pohnpei",
	"Pacific/Ponape",
	"Pacific/Port_Moresby",
	"Pacific/Rarotonga",
	"Pacific/Saipan",
	"Pacific/Samoa",
	"Pacific/Tahiti",
	"Pacific/Tarawa",
	"Pacific/Tongatapu",
	"Pacific/Truk",
	"Pacific/Wake",
	"Pacific/Wallis",
	"Pacific/Yap",
	"Poland",
	"Portugal",
	"posix/Africa/Abidjan",
	"posix/Africa/Accra",
	"posix/Africa/Addis_Ababa",
	"posix/Africa/Algiers",
	"posix/Africa/Asmara",
	"posix/Africa/Asmera",
	"posix/Africa/Bamako",
	"posix/Africa/Bangui",
	"posix/Africa/Banjul",
	"posix/Africa/Bissau",
	"posix/Africa/Blantyre",
	"posix/Africa/Brazzaville",
	"posix/Africa/Bujumbura",
	"posix/Africa/Cairo",
	"posix/Africa/Casablanca",
	"posix/Africa/Ceuta",
	"posix/Africa/Conakry",
	"posix/Africa/Dakar",
	"posix/Africa/Dar_es_Salaam",
	"posix/Africa/Djibouti",
	"posix/Africa/Douala",
	"posix/Africa/El_Aaiun",
	"posix/Africa/Freetown",
	"posix/Africa/Gaborone",
	"posix/Africa/Harare",
	"posix/Africa/Johannesburg",
	"posix/Africa/Juba",
	"posix/Africa/Kampala",
	"posix/Africa/Khartoum",
	"posix/Africa/Kigali",
	"posix/Africa/Kinshasa",
	"posix/Africa/Lagos",
	"posix/Africa/Libreville",
	"posix/Africa/Lome",
	"posix/Africa/Luanda",
	"posix/Africa/Lubumbashi",
	"posix/Africa/Lusaka",
	"posix/Africa/Malabo",
	"posix/Africa/Maputo",
	"posix/Africa/Maseru",
	"posix/Africa/Mbabane",
	"posix/Africa/Mogadishu",
	"posix/Africa/Monrovia",
	"posix/Africa/Nairobi",
	"posix/Africa/Ndjamena",
	"posix/Africa/Niamey",
	"posix/Africa/Nouakchott",
	"posix/Africa/Ouagadougou",
	"posix/Africa/Porto-Novo",
	"posix/Africa/Sao_Tome",
	"posix/Africa/Timbuktu",
	"posix/Africa/Tripoli",
	"posix/Africa/Tunis",
	"posix/Africa/Windhoek",
	"posix/America/Adak",
	"posix/America/Anchorage",
	"posix/America/Anguilla",
	"posix/America/Antigua",
	"posix/America/Araguaina",
	"posix/America/Argentina/Buenos_Aires",
	"posix/America/Argentina/Catamarca",
	"posix/America/Argentina/ComodRivadavia",
	"posix/America/Argentina/Cordoba",
	"posix/America/Argentina/Jujuy",
	"posix/America/Argentina/La_Rioja",
	"posix/America/Argentina/Mendoza",
	"posix/America/Argentina/Rio_Gallegos",
	"posix/America/Argentina/Salta",
	"posix/America/Argentina/San_Juan",
	"posix/America/Argentina/San_Luis",
	"posix/America/Argentina/Tucuman",
	"posix/America/Argentina/Ushuaia",
	"posix/America/Aruba",
	"posix/America/Asuncion",
	"posix/America/Atikokan",
	"posix/America/Atka",
	"posix/America/Bahia",
	"posix/America/Bahia_Banderas",
	"posix/America/Barbados",
	"posix/America/Belem",
	"posix/America/Belize",
	"posix/America/Blanc-Sablon",
	"posix/America/Boa_Vista",
	"posix/America/Bogota",
	"posix/America/Boise",
	"posix/America/Buenos_Aires",
	"posix/America/Cambridge_Bay",
	"posix/America/Campo_Grande",
	"posix/America/Cancun",
	"posix/America/Caracas",
	"posix/America/Catamarca",
	"posix/America/Cayenne",
	"posix/America/Cayman",
	"posix/America/Chicago",
	"posix/America/Chihuahua",
	"posix/America/Ciudad_Juarez",
	"posix/America/Coral_Harbor",
	"posix/America/Cordoba",
	"posix/America/Costa_Rica",
	"posix/America/Creston",
	"posix/America/Cuiaba",
	"posix/America/Curacao",
	"posix/America/Danmarkshavn",
	"posix/America/Dawson",
	"posix/America/Dawson_Creek",
	"posix/America/Denver",
	"posix/America/Detroit",
	"posix/America/Dominica",
	"posix/America/Edmonton",
	"posix/America/Eirunepe",
	"posix/America/El_Salvador",
	"posix/America/Ensenada",
	"posix/America/Fortaleza",
	"posix/America/Fort_Nelson",
	"posix/America/Fort_Wayne",
	"posix/America/Glace_Bay",
	"posix/America/Godthab",
	"posix/America/Goose_Bay",
	"posix/America/Grand_Turk",
	"posix/America/Grenada",
	"posix/America/Guadeloupe",
	"posix/America/Guatemala",
	"posix/America/Guayaquil",
	"posix/America/Guyana",
	"posix/America/Halifax",
	"posix/America/Havana",
	"posix/America/Hermosillo",
	"posix/America/Indiana/Indianapolis",
	"posix/America/Indiana/Knox",
	"posix/America/Indiana/Marengo",
	"posix/America/Indiana/Petersburg",
	"posix/America/Indianapolis",
	"posix/America/Indiana/Tell_City",
	"posix/America/Indiana/Vevay",
	"posix/America/Indiana/Vincennes",
	"posix/America/Indiana/Winamac",
	"posix/America/Inuvik",
	"posix/America/Iqaluit",
	"posix/America/Jamaica",
	"posix/America/Jujuy",
	"posix/America/Juneau",
	"posix/America/Kentucky/Louisville",
	"posix/America/Kentucky/Monticello",
	"posix/America/Knox_IN",
	"posix/America/Kralendijk",
	"posix/America/La_Paz",
	"posix/America/Lima",
	"posix/America/Los_Angeles",
	"posix/America/Louisville",
	"posix/America/Lower_Princes",
	"posix/America/Maceio",
	"posix/America/Managua",
	"posix/America/Manaus",
	"posix/America/Marigot",
	"posix/America/Martinique",
	"posix/America/Matamoros",
	"posix/America/Mazatlan",
	"posix/America/Mendoza",
	"posix/America/Menominee",
	"posix/America/Merida",
	"posix/America/Metlakatla",
	"posix/America/Mexico_City",
	"posix/America/Miquelon",
	"posix/America/Moncton",
	"posix/America/Monterrey",
	"posix/America/Montevideo",
	"posix/America/Montreal",
	"posix/America/Montserrat",
	"posix/America/Nassau",
	"posix/America/New_York",
	"posix/America/Nipigon",
	"posix/America/Nome",
	"posix/America/Noronha",
	"posix/America/North_Dakota/Beulah",
	"posix/America/North_Dakota/Center",
	"posix/America/North_Dakota/New_Salem",
	"posix/America/Nuuk",
	"posix/America/Ojinaga",
	"posix/America/Panama",
	"posix/America/Pangnirtung",
	"posix/America/Paramaribo",
	"posix/America/Phoenix",
	"posix/America/Port-au-Prince",
	"posix/America/Porto_Acre",
	"posix/America/Port_of_Spain",
	"posix/America/Porto_Velho",
	"posix/America/Puerto_Rico",
	"posix/America/Punta_Arenas",
	"posix/America/Rainy_River",
	"posix/America/Rankin_Inlet",
	"posix/America/Recife",
	"posix/America/Regina",
	"posix/America/Resolute",
	"posix/America/Rio_Branco",
	"posix/America/Rosario",
	"posix/America/Santa_Isabel",
	"posix/America/Santarem",
	"posix/America/Santiago",
	"posix/America/Santo_Domingo",
	"posix/America/Sao_Paulo",
	"posix/America/Scoresbysund",
	"posix/America/Shiprock",
	"posix/America/Sitka",
	"posix/America/St_Barthelemy",
	"posix/America/St_Johns",
	"posix/America/St_Kitts",
	"posix/America/St_Lucia",
	"posix/America/St_Thomas",
	"posix/America/St_Vincent",
	"posix/America/Swift_Current",
	"posix/America/Tegucigalpa",
	"posix/America/Thule",
	"posix/America/Thunder_Bay",
	"posix/America/Tijuana",
	"posix/America/Toronto",
	"posix/America/Tortola",
	"posix/America/Vancouver",
	"posix/America/Virgin",
	"posix/America/Whitehorse",
	"posix/America/Winnipeg",
	"posix/America/Yakutat",
	"posix/America/Yellowknife",
	"posix/Antarctica/Casey",
	"posix/Antarctica/Davis",
	"posix/Antarctica/DumontDUrville",
	"posix/Antarctica/Macquarie",
	"posix/Antarctica/Mawson",
	"posix/Antarctica/McMurdo",
	"posix/Antarctica/Palmer",
	"posix/Antarctica/Rothera",
	"posix/Antarctica/South_Pole",
	"posix/Antarctica/Syowa",
	"posix/Antarctica/Troll",
	"posix/Antarctica/Vostok",
	"posix/Arctic/Longyearbyen",
	"posix/Asia/Aden",
	"posix/Asia/Almaty",
	"posix/Asia/Amman",
	"posix/Asia/Anadyr",
	"posix/Asia/Aqtau",
	"posix/Asia/Aqtobe",
	"posix/Asia/Ashgabat",
	"posix/Asia/Ashkhabad",
	"posix/Asia/Atyrau",
	"posix/Asia/Baghdad",
	"posix/Asia/Bahrain",
	"posix/Asia/Baku",
	"posix/Asia/Bangkok",
	"posix/Asia/Barnaul",
	"posix/Asia/Beirut",
	"posix/Asia/Bishkek",
	"posix/Asia/Brunei",
	"posix/Asia/Calcutta",
	"posix/Asia/Chita",
	"posix/Asia/Choibalsan",
	"posix/Asia/Chongqing",
	"posix/Asia/Chungking",
	"posix/Asia/Colombo",
	"posix/Asia/Dacca",
	"posix/Asia/Damascus",
	"posix/Asia/Dhaka",
	"posix/Asia/Dili",
	"posix/Asia/Dubai",
	"posix/Asia/Dushanbe",
	"posix/Asia/Famagusta",
	"posix/Asia/Gaza",
	"posix/Asia/Harbin",
	"posix/Asia/Hebron",
	"posix/Asia/Ho_Chi_Minh",
	"posix/Asia/Hong_Kong",
	"posix/Asia/Hovd",
	"posix/Asia/Irkutsk",
	"posix/Asia/Istanbul",
	"posix/Asia/Jakarta",
	"posix/Asia/Jayapura",
	"posix/Asia/Jerusalem",
	"posix/Asia/Kabul",
	"posix/Asia/Kamchatka",
	"posix/Asia/Karachi",
	"posix/Asia/Kashgar",
	"posix/Asia/Kathmandu",
	"posix/Asia/Katmandu",
	"posix/Asia/Khandyga",
	"posix/Asia/Kolkata",
	"posix/Asia/Krasnoyarsk",
	"posix/Asia/Kuala_Lumpur",
	"posix/Asia/Kuching",
	"posix/Asia/Kuwait",
	"posix/Asia/Macao",
	"posix/Asia/Macau",
	"posix/Asia/Magadan",
	"posix/Asia/Makassar",
	"posix/Asia/Manila",
	"posix/Asia/Muscat",
	"posix/Asia/Nicosia",
	"posix/Asia/Novokuznetsk",
	"posix/Asia/Novosibirsk",
	"posix/Asia/Omsk",
	"posix/Asia/Oral",
	"posix/Asia/Phnom_Penh",
	"posix/Asia/Pontianak",
	"posix/Asia/Pyongyang",
	"posix/Asia/Qatar",
	"posix/Asia/Qostanay",
	"posix/Asia/Qyzylorda",
	"posix/Asia/Rangoon",
	"posix/Asia/Riyadh",
	"posix/Asia/Saigon",
	"posix/Asia/Sakhalin",
	"posix/Asia/Samarkand",
	"posix/Asia/Seoul",
	"posix/Asia/Shanghai",
	"posix/Asia/Singapore",
	"posix/Asia/Srednekolymsk",
	"posix/Asia/Taipei",
	"posix/Asia/Tashkent",
	"posix/Asia/Tbilisi",
	"posix/Asia/Tehran",
	"posix/Asia/Tel_Aviv",
	"posix/Asia/Thimbu",
	"posix/Asia/Thimphu",
	"posix/Asia/Tokyo",
	"posix/Asia/Tomsk",
	"posix/Asia/Ujung_Pandang",
	"posix/Asia/Ulaanbaatar",
	"posix/Asia/Ulan_Bator",
	"posix/Asia/Urumqi",
	"posix/Asia/Ust-Nera",
	"posix/Asia/Vientiane",
	"posix/Asia/Vladivostok",
	"posix/Asia/Yakutsk",
	"posix/Asia/Yangon",
	"posix/Asia/Yekaterinburg",
	"posix/Asia/Yerevan",
	"posix/Atlantic/Azores",
	"posix/Atlantic/Bermuda",
	"posix/Atlantic/Canary",
	"posix/Atlantic/Cape_Verde",
	"posix/Atlantic/Faeroe",
	"posix/Atlantic/Faroe",
	"posix/Atlantic/Jan_Mayen",
	"posix/Atlantic/Madeira",
	"posix/Atlantic/Reykjavik",
	"posix/Atlantic/South_Georgia",
	"posix/Atlantic/Stanley",
	"posix/Atlantic/St_Helena",
	"posix/Australia/ACT",
	"posix/Australia/Adelaide",
	"posix/Australia/Brisbane",
	"posix/Australia/Broken_Hill",
	"posix/Australia/Canberra",
	"posix/Australia/Currie",
	"posix/Australia/Darwin",
	"posix/Australia/Eucla",
	"posix/Australia/Hobart",
	"posix/Australia/LHI",
	"posix/Australia/Lindeman",
	"posix/Australia/Lord_Howe",
	"posix/Australia/Melbourne",
	"posix/Australia/North",
	"posix/Australia/NSW",
	"posix/Australia/Perth",
	"posix/Australia/Queensland",
	"posix/Australia/South",
	"posix/Australia/Sydney",
	"posix/Australia/Tasmania",
	"posix/Australia/Victoria",
	"posix/Australia/West",
	"posix/Australia/Yancowinna",
	"posix/Brazil/Acre",
	"posix/Brazil/DeNoronha",
	"posix/Brazil/East",
	"posix/Brazil/West",
	"posix/Canada/Atlantic",
	"posix/Canada/Central",
	"posix/Canada/Eastern",
	"posix/Canada/Mountain",
	"posix/Canada/Newfoundland",
	"posix/Canada/Pacific",
	"posix/Canada/Saskatchewan",
	"posix/Canada/Yukon",
	"posix/CET",
	"posix/Chile/Continental",
	"posix/Chile/EasterIsland",
	"posix/CST6CDT",
	"posix/Cuba",
	"posix/EET",
	"posix/Egypt",
	"posix/Eire",
	"posix/EST",
	"posix/EST5EDT",
	"posix/Etc/GMT",
	"posix/Etc/GMT+0",
	"posix/Etc/GMT-0",
	"posix/Etc/GMT0",
	"posix/Etc/GMT+1",
	"posix/Etc/GMT-1",
	"posix/Etc/GMT+10",
	"posix/Etc/GMT-10",
	"posix/Etc/GMT+11",
	"posix/Etc/GMT-11",
	"posix/Etc/GMT+12",
	"posix/Etc/GMT-12",
	"posix/Etc/GMT-13",
	"posix/Etc/GMT-14",
	"posix/Etc/GMT+2",
	"posix/Etc/GMT-2",
	"posix/Etc/GMT+3",
	"posix/Etc/GMT-3",
	"posix/Etc/GMT+4",
	"posix/Etc/GMT-4",
	"posix/Etc/GMT+5",
	"posix/Etc/GMT-5",
	"posix/Etc/GMT+6",
	"posix/Etc/GMT-6",
	"posix/Etc/GMT+7",
	"posix/Etc/GMT-7",
	"posix/Etc/GMT+8",
	"posix/Etc/GMT-8",
	"posix/Etc/GMT+9",
	"posix/Etc/GMT-9",
	"posix/Etc/Greenwich",
	"posix/Etc/UCT",
	"posix/Etc/Universal",
	"posix/Etc/UTC",
	"posix/Etc/Zulu",
	"posix/Europe/Amsterdam",
}
