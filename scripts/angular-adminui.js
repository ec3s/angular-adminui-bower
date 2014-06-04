(function(undefined) {
    var moment, VERSION = "2.6.0", globalScope = typeof global !== "undefined" ? global : this, oldGlobalMoment, round = Math.round, i, YEAR = 0, MONTH = 1, DATE = 2, HOUR = 3, MINUTE = 4, SECOND = 5, MILLISECOND = 6, languages = {}, momentProperties = {
        _isAMomentObject: null,
        _i: null,
        _f: null,
        _l: null,
        _strict: null,
        _isUTC: null,
        _offset: null,
        _pf: null,
        _lang: null
    }, hasModule = typeof module !== "undefined" && module.exports, aspNetJsonRegex = /^\/?Date\((\-?\d+)/i, aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/, isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/, formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g, localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g, parseTokenOneOrTwoDigits = /\d\d?/, parseTokenOneToThreeDigits = /\d{1,3}/, parseTokenOneToFourDigits = /\d{1,4}/, parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, parseTokenDigits = /\d+/, parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, parseTokenT = /T/i, parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, parseTokenOrdinal = /\d{1,2}/, parseTokenOneDigit = /\d/, parseTokenTwoDigits = /\d\d/, parseTokenThreeDigits = /\d{3}/, parseTokenFourDigits = /\d{4}/, parseTokenSixDigits = /[+-]?\d{6}/, parseTokenSignedNumber = /[+-]?\d+/, isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/, isoFormat = "YYYY-MM-DDTHH:mm:ssZ", isoDates = [ [ "YYYYYY-MM-DD", /[+-]\d{6}-\d{2}-\d{2}/ ], [ "YYYY-MM-DD", /\d{4}-\d{2}-\d{2}/ ], [ "GGGG-[W]WW-E", /\d{4}-W\d{2}-\d/ ], [ "GGGG-[W]WW", /\d{4}-W\d{2}/ ], [ "YYYY-DDD", /\d{4}-\d{3}/ ] ], isoTimes = [ [ "HH:mm:ss.SSSS", /(T| )\d\d:\d\d:\d\d\.\d+/ ], [ "HH:mm:ss", /(T| )\d\d:\d\d:\d\d/ ], [ "HH:mm", /(T| )\d\d:\d\d/ ], [ "HH", /(T| )\d\d/ ] ], parseTimezoneChunker = /([\+\-]|\d\d)/gi, proxyGettersAndSetters = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"), unitMillisecondFactors = {
        Milliseconds: 1,
        Seconds: 1e3,
        Minutes: 6e4,
        Hours: 36e5,
        Days: 864e5,
        Months: 2592e6,
        Years: 31536e6
    }, unitAliases = {
        ms: "millisecond",
        s: "second",
        m: "minute",
        h: "hour",
        d: "day",
        D: "date",
        w: "week",
        W: "isoWeek",
        M: "month",
        Q: "quarter",
        y: "year",
        DDD: "dayOfYear",
        e: "weekday",
        E: "isoWeekday",
        gg: "weekYear",
        GG: "isoWeekYear"
    }, camelFunctions = {
        dayofyear: "dayOfYear",
        isoweekday: "isoWeekday",
        isoweek: "isoWeek",
        weekyear: "weekYear",
        isoweekyear: "isoWeekYear"
    }, formatFunctions = {}, ordinalizeTokens = "DDD w W M D d".split(" "), paddedTokens = "M D H h m s w W".split(" "), formatTokenFunctions = {
        M: function() {
            return this.month() + 1;
        },
        MMM: function(format) {
            return this.lang().monthsShort(this, format);
        },
        MMMM: function(format) {
            return this.lang().months(this, format);
        },
        D: function() {
            return this.date();
        },
        DDD: function() {
            return this.dayOfYear();
        },
        d: function() {
            return this.day();
        },
        dd: function(format) {
            return this.lang().weekdaysMin(this, format);
        },
        ddd: function(format) {
            return this.lang().weekdaysShort(this, format);
        },
        dddd: function(format) {
            return this.lang().weekdays(this, format);
        },
        w: function() {
            return this.week();
        },
        W: function() {
            return this.isoWeek();
        },
        YY: function() {
            return leftZeroFill(this.year() % 100, 2);
        },
        YYYY: function() {
            return leftZeroFill(this.year(), 4);
        },
        YYYYY: function() {
            return leftZeroFill(this.year(), 5);
        },
        YYYYYY: function() {
            var y = this.year(), sign = y >= 0 ? "+" : "-";
            return sign + leftZeroFill(Math.abs(y), 6);
        },
        gg: function() {
            return leftZeroFill(this.weekYear() % 100, 2);
        },
        gggg: function() {
            return leftZeroFill(this.weekYear(), 4);
        },
        ggggg: function() {
            return leftZeroFill(this.weekYear(), 5);
        },
        GG: function() {
            return leftZeroFill(this.isoWeekYear() % 100, 2);
        },
        GGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 4);
        },
        GGGGG: function() {
            return leftZeroFill(this.isoWeekYear(), 5);
        },
        e: function() {
            return this.weekday();
        },
        E: function() {
            return this.isoWeekday();
        },
        a: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), true);
        },
        A: function() {
            return this.lang().meridiem(this.hours(), this.minutes(), false);
        },
        H: function() {
            return this.hours();
        },
        h: function() {
            return this.hours() % 12 || 12;
        },
        m: function() {
            return this.minutes();
        },
        s: function() {
            return this.seconds();
        },
        S: function() {
            return toInt(this.milliseconds() / 100);
        },
        SS: function() {
            return leftZeroFill(toInt(this.milliseconds() / 10), 2);
        },
        SSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        SSSS: function() {
            return leftZeroFill(this.milliseconds(), 3);
        },
        Z: function() {
            var a = -this.zone(), b = "+";
            if (a < 0) {
                a = -a;
                b = "-";
            }
            return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
        },
        ZZ: function() {
            var a = -this.zone(), b = "+";
            if (a < 0) {
                a = -a;
                b = "-";
            }
            return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
        },
        z: function() {
            return this.zoneAbbr();
        },
        zz: function() {
            return this.zoneName();
        },
        X: function() {
            return this.unix();
        },
        Q: function() {
            return this.quarter();
        }
    }, lists = [ "months", "monthsShort", "weekdays", "weekdaysShort", "weekdaysMin" ];
    function defaultParsingFlags() {
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false
        };
    }
    function deprecate(msg, fn) {
        var firstTime = true;
        function printMsg() {
            if (moment.suppressDeprecationWarnings === false && typeof console !== "undefined" && console.warn) {
                console.warn("Deprecation warning: " + msg);
            }
        }
        return extend(function() {
            if (firstTime) {
                printMsg();
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }
    function padToken(func, count) {
        return function(a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function(a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }
    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + "o"] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
    function Language() {}
    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration), years = normalizedInput.year || 0, quarters = normalizedInput.quarter || 0, months = normalizedInput.month || 0, weeks = normalizedInput.week || 0, days = normalizedInput.day || 0, hours = normalizedInput.hour || 0, minutes = normalizedInput.minute || 0, seconds = normalizedInput.second || 0, milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
        this._days = +days + weeks * 7;
        this._months = +months + quarters * 3 + years * 12;
        this._data = {};
        this._bubble();
    }
    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }
        if (b.hasOwnProperty("toString")) {
            a.toString = b.toString;
        }
        if (b.hasOwnProperty("valueOf")) {
            a.valueOf = b.valueOf;
        }
        return a;
    }
    function cloneMoment(m) {
        var result = {}, i;
        for (i in m) {
            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                result[i] = m[i];
            }
        }
        return result;
    }
    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }
    function leftZeroFill(number, targetLength, forceSign) {
        var output = "" + Math.abs(number), sign = number >= 0;
        while (output.length < targetLength) {
            output = "0" + output;
        }
        return (sign ? forceSign ? "+" : "" : "-") + output;
    }
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds, days = duration._days, months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;
        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, "Date", rawGetter(mom, "Date") + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, "Month") + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }
    function isArray(input) {
        return Object.prototype.toString.call(input) === "[object Array]";
    }
    function isDate(input) {
        return Object.prototype.toString.call(input) === "[object Date]" || input instanceof Date;
    }
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length), lengthDiff = Math.abs(array1.length - array2.length), diffs = 0, i;
        for (i = 0; i < len; i++) {
            if (dontConvert && array1[i] !== array2[i] || !dontConvert && toInt(array1[i]) !== toInt(array2[i])) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }
    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, "$1");
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }
    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {}, normalizedProp, prop;
        for (prop in inputObject) {
            if (inputObject.hasOwnProperty(prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }
        return normalizedInput;
    }
    function makeList(field) {
        var count, setter;
        if (field.indexOf("week") === 0) {
            count = 7;
            setter = "day";
        } else if (field.indexOf("month") === 0) {
            count = 12;
            setter = "month";
        } else {
            return;
        }
        moment[field] = function(format, index) {
            var i, getter, method = moment.fn._lang[field], results = [];
            if (typeof format === "number") {
                index = format;
                format = undefined;
            }
            getter = function(i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || "");
            };
            if (index != null) {
                return getter(index);
            } else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }
    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion, value = 0;
        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }
        return value;
    }
    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }
    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([ year, 11, 31 + dow - doy ]), dow, doy).week;
    }
    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }
    function isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
    }
    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }
            m._pf.overflow = overflow;
        }
    }
    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
            if (m._strict) {
                m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }
    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace("_", "-") : key;
    }
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local();
    }
    extend(Language.prototype, {
        set: function(config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === "function") {
                    this[i] = prop;
                } else {
                    this["_" + i] = prop;
                }
            }
        },
        _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months: function(m) {
            return this._months[m.month()];
        },
        _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort: function(m) {
            return this._monthsShort[m.month()];
        },
        monthsParse: function(monthName) {
            var i, mom, regex;
            if (!this._monthsParse) {
                this._monthsParse = [];
            }
            for (i = 0; i < 12; i++) {
                if (!this._monthsParse[i]) {
                    mom = moment.utc([ 2e3, i ]);
                    regex = "^" + this.months(mom, "") + "|^" + this.monthsShort(mom, "");
                    this._monthsParse[i] = new RegExp(regex.replace(".", ""), "i");
                }
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },
        _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays: function(m) {
            return this._weekdays[m.day()];
        },
        _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort: function(m) {
            return this._weekdaysShort[m.day()];
        },
        _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin: function(m) {
            return this._weekdaysMin[m.day()];
        },
        weekdaysParse: function(weekdayName) {
            var i, mom, regex;
            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }
            for (i = 0; i < 7; i++) {
                if (!this._weekdaysParse[i]) {
                    mom = moment([ 2e3, 1 ]).day(i);
                    regex = "^" + this.weekdays(mom, "") + "|^" + this.weekdaysShort(mom, "") + "|^" + this.weekdaysMin(mom, "");
                    this._weekdaysParse[i] = new RegExp(regex.replace(".", ""), "i");
                }
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },
        _longDateFormat: {
            LT: "h:mm A",
            L: "MM/DD/YYYY",
            LL: "MMMM D YYYY",
            LLL: "MMMM D YYYY LT",
            LLLL: "dddd, MMMM D YYYY LT"
        },
        longDateFormat: function(key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },
        isPM: function(input) {
            return (input + "").toLowerCase().charAt(0) === "p";
        },
        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function(hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? "pm" : "PM";
            } else {
                return isLower ? "am" : "AM";
            }
        },
        _calendar: {
            sameDay: "[Today at] LT",
            nextDay: "[Tomorrow at] LT",
            nextWeek: "dddd [at] LT",
            lastDay: "[Yesterday at] LT",
            lastWeek: "[Last] dddd [at] LT",
            sameElse: "L"
        },
        calendar: function(key, mom) {
            var output = this._calendar[key];
            return typeof output === "function" ? output.apply(mom) : output;
        },
        _relativeTime: {
            future: "in %s",
            past: "%s ago",
            s: "a few seconds",
            m: "a minute",
            mm: "%d minutes",
            h: "an hour",
            hh: "%d hours",
            d: "a day",
            dd: "%d days",
            M: "a month",
            MM: "%d months",
            y: "a year",
            yy: "%d years"
        },
        relativeTime: function(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return typeof output === "function" ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number);
        },
        pastFuture: function(diff, output) {
            var format = this._relativeTime[diff > 0 ? "future" : "past"];
            return typeof format === "function" ? format(output) : format.replace(/%s/i, output);
        },
        ordinal: function(number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal: "%d",
        preparse: function(string) {
            return string;
        },
        postformat: function(string) {
            return string;
        },
        week: function(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },
        _week: {
            dow: 0,
            doy: 6
        },
        _invalidDate: "Invalid date",
        invalidDate: function() {
            return this._invalidDate;
        }
    });
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }
    function unloadLang(key) {
        delete languages[key];
    }
    function getLangDefinition(key) {
        var i = 0, j, lang, next, split, get = function(k) {
            if (!languages[k] && hasModule) {
                try {
                    require("./lang/" + k);
                } catch (e) {}
            }
            return languages[k];
        };
        if (!key) {
            return moment.fn._lang;
        }
        if (!isArray(key)) {
            lang = get(key);
            if (lang) {
                return lang;
            }
            key = [ key ];
        }
        while (i < key.length) {
            split = normalizeLanguage(key[i]).split("-");
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split("-") : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join("-"));
                if (lang) {
                    return lang;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    break;
                }
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }
    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }
    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;
        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }
        return function(mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.lang().invalidDate();
        }
        format = expandFormat(format, m.lang());
        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }
        return formatFunctions[format](m);
    }
    function expandFormat(format, lang) {
        var i = 5;
        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }
        return format;
    }
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
          case "Q":
            return parseTokenOneDigit;

          case "DDDD":
            return parseTokenThreeDigits;

          case "YYYY":
          case "GGGG":
          case "gggg":
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;

          case "Y":
          case "G":
          case "g":
            return parseTokenSignedNumber;

          case "YYYYYY":
          case "YYYYY":
          case "GGGGG":
          case "ggggg":
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;

          case "S":
            if (strict) {
                return parseTokenOneDigit;
            }

          case "SS":
            if (strict) {
                return parseTokenTwoDigits;
            }

          case "SSS":
            if (strict) {
                return parseTokenThreeDigits;
            }

          case "DDD":
            return parseTokenOneToThreeDigits;

          case "MMM":
          case "MMMM":
          case "dd":
          case "ddd":
          case "dddd":
            return parseTokenWord;

          case "a":
          case "A":
            return getLangDefinition(config._l)._meridiemParse;

          case "X":
            return parseTokenTimestampMs;

          case "Z":
          case "ZZ":
            return parseTokenTimezone;

          case "T":
            return parseTokenT;

          case "SSSS":
            return parseTokenDigits;

          case "MM":
          case "DD":
          case "YY":
          case "GG":
          case "gg":
          case "HH":
          case "hh":
          case "mm":
          case "ss":
          case "ww":
          case "WW":
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;

          case "M":
          case "D":
          case "d":
          case "H":
          case "h":
          case "m":
          case "s":
          case "w":
          case "W":
          case "e":
          case "E":
            return parseTokenOneOrTwoDigits;

          case "Do":
            return parseTokenOrdinal;

          default:
            a = new RegExp(regexpEscape(unescapeFormat(token.replace("\\", "")), "i"));
            return a;
        }
    }
    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = string.match(parseTokenTimezone) || [], tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [], parts = (tzChunk + "").match(parseTimezoneChunker) || [ "-", 0, 0 ], minutes = +(parts[1] * 60) + toInt(parts[2]);
        return parts[0] === "+" ? -minutes : minutes;
    }
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;
        switch (token) {
          case "Q":
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;

          case "M":
          case "MM":
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;

          case "MMM":
          case "MMMM":
            a = getLangDefinition(config._l).monthsParse(input);
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;

          case "D":
          case "DD":
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;

          case "Do":
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(input, 10));
            }
            break;

          case "DDD":
          case "DDDD":
            if (input != null) {
                config._dayOfYear = toInt(input);
            }
            break;

          case "YY":
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;

          case "YYYY":
          case "YYYYY":
          case "YYYYYY":
            datePartArray[YEAR] = toInt(input);
            break;

          case "a":
          case "A":
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;

          case "H":
          case "HH":
          case "h":
          case "hh":
            datePartArray[HOUR] = toInt(input);
            break;

          case "m":
          case "mm":
            datePartArray[MINUTE] = toInt(input);
            break;

          case "s":
          case "ss":
            datePartArray[SECOND] = toInt(input);
            break;

          case "S":
          case "SS":
          case "SSS":
          case "SSSS":
            datePartArray[MILLISECOND] = toInt(("0." + input) * 1e3);
            break;

          case "X":
            config._d = new Date(parseFloat(input) * 1e3);
            break;

          case "Z":
          case "ZZ":
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;

          case "w":
          case "ww":
          case "W":
          case "WW":
          case "d":
          case "dd":
          case "ddd":
          case "dddd":
          case "e":
          case "E":
            token = token.substr(0, 1);

          case "gg":
          case "gggg":
          case "GG":
          case "GGGG":
          case "GGGGG":
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = input;
            }
            break;
        }
    }
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse, fixYear, w, temp, lang, weekday, week;
        if (config._d) {
            return;
        }
        currentDate = currentDateArray(config);
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            fixYear = function(val) {
                var intVal = parseInt(val, 10);
                return val ? val.length < 3 ? intVal > 68 ? 1900 + intVal : 2e3 + intVal : intVal : config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR];
            };
            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1);
            } else {
                lang = getLangDefinition(config._l);
                weekday = w.d != null ? parseWeekday(w.d, lang) : w.e != null ? parseInt(w.e, 10) + lang._week.dow : 0;
                week = parseInt(w.w, 10) || 1;
                if (w.d != null && weekday < lang._week.dow) {
                    week++;
                }
                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow);
            }
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
        if (config._dayOfYear) {
            yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];
            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }
            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }
        for (;i < 7; i++) {
            config._a[i] = input[i] = config._a[i] == null ? i === 2 ? 1 : 0 : config._a[i];
        }
        input[HOUR] += toInt((config._tzm || 0) / 60);
        input[MINUTE] += toInt((config._tzm || 0) % 60);
        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
    }
    function dateFromObject(config) {
        var normalizedInput;
        if (config._d) {
            return;
        }
        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [ normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond ];
        dateFromConfig(config);
    }
    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [ now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() ];
        } else {
            return [ now.getFullYear(), now.getMonth(), now.getDate() ];
        }
    }
    function makeDateFromStringAndFormat(config) {
        config._a = [];
        config._pf.empty = true;
        var lang = getLangDefinition(config._l), string = "" + config._i, i, parsedInput, tokens, token, skipped, stringLength = string.length, totalParsedInputLength = 0;
        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                } else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }
        dateFromConfig(config);
        checkOverflow(config);
    }
    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }
    function makeDateFromStringAndArray(config) {
        var tempConfig, bestMoment, scoreToBeat, i, currentScore;
        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }
        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);
            if (!isValid(tempConfig)) {
                continue;
            }
            currentScore += tempConfig._pf.charsLeftOver;
            currentScore += tempConfig._pf.unusedTokens.length * 10;
            tempConfig._pf.score = currentScore;
            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }
        extend(config, bestMoment || tempConfig);
    }
    function makeDateFromString(config) {
        var i, l, string = config._i, match = isoRegex.exec(string);
        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += "Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            moment.createFromInputFallback(config);
        }
    }
    function makeDateFromInput(config) {
        var input = config._i, matched = aspNetJsonRegex.exec(input);
        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === "string") {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof input === "object") {
            dateFromObject(config);
        } else if (typeof input === "number") {
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }
    function makeDate(y, m, d, h, M, s, ms) {
        var date = new Date(y, m, d, h, M, s, ms);
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }
    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }
    function parseWeekday(input, language) {
        if (typeof input === "string") {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            } else {
                input = language.weekdaysParse(input);
                if (typeof input !== "number") {
                    return null;
                }
            }
        }
        return input;
    }
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1e3), minutes = round(seconds / 60), hours = round(minutes / 60), days = round(hours / 24), years = round(days / 365), args = seconds < 45 && [ "s", seconds ] || minutes === 1 && [ "m" ] || minutes < 45 && [ "mm", minutes ] || hours === 1 && [ "h" ] || hours < 22 && [ "hh", hours ] || days === 1 && [ "d" ] || days <= 25 && [ "dd", days ] || days <= 45 && [ "M" ] || days < 345 && [ "MM", round(days / 30) ] || years === 1 && [ "y" ] || [ "yy", years ];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek, daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(), adjustedMoment;
        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }
        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }
        adjustedMoment = moment(mom).add("d", daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }
    function makeMoment(config) {
        var input = config._i, format = config._f;
        if (input === null || format === undefined && input === "") {
            return moment.invalid({
                nullInput: true
            });
        }
        if (typeof input === "string") {
            config._i = input = getLangDefinition().preparse(input);
        }
        if (moment.isMoment(input)) {
            config = cloneMoment(input);
            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }
        return new Moment(config);
    }
    moment = function(input, format, lang, strict) {
        var c;
        if (typeof lang === "boolean") {
            strict = lang;
            lang = undefined;
        }
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();
        return makeMoment(c);
    };
    moment.suppressDeprecationWarnings = false;
    moment.createFromInputFallback = deprecate("moment construction falls back to js Date. This is " + "discouraged and will be removed in upcoming major " + "release. Please refer to " + "https://github.com/moment/moment/issues/1407 for more info.", function(config) {
        config._d = new Date(config._i);
    });
    moment.utc = function(input, format, lang, strict) {
        var c;
        if (typeof lang === "boolean") {
            strict = lang;
            lang = undefined;
        }
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();
        return makeMoment(c).utc();
    };
    moment.unix = function(input) {
        return moment(input * 1e3);
    };
    moment.duration = function(input, key) {
        var duration = input, match = null, sign, ret, parseIso;
        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === "number") {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = match[1] === "-" ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = match[1] === "-" ? -1 : 1;
            parseIso = function(inp) {
                var res = inp && parseFloat(inp.replace(",", "."));
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        }
        ret = new Duration(duration);
        if (moment.isDuration(input) && input.hasOwnProperty("_lang")) {
            ret._lang = input._lang;
        }
        return ret;
    };
    moment.version = VERSION;
    moment.defaultFormat = isoFormat;
    moment.momentProperties = momentProperties;
    moment.updateOffset = function() {};
    moment.lang = function(key, values) {
        var r;
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(normalizeLanguage(key), values);
        } else if (values === null) {
            unloadLang(key);
            key = "en";
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };
    moment.langData = function(key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };
    moment.isMoment = function(obj) {
        return obj instanceof Moment || obj != null && obj.hasOwnProperty("_isAMomentObject");
    };
    moment.isDuration = function(obj) {
        return obj instanceof Duration;
    };
    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }
    moment.normalizeUnits = function(units) {
        return normalizeUnits(units);
    };
    moment.invalid = function(flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        } else {
            m._pf.userInvalidated = true;
        }
        return m;
    };
    moment.parseZone = function() {
        return moment.apply(null, arguments).parseZone();
    };
    moment.parseTwoDigitYear = function(input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2e3);
    };
    extend(moment.fn = Moment.prototype, {
        clone: function() {
            return moment(this);
        },
        valueOf: function() {
            return +this._d + (this._offset || 0) * 6e4;
        },
        unix: function() {
            return Math.floor(+this / 1e3);
        },
        toString: function() {
            return this.clone().lang("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },
        toDate: function() {
            return this._offset ? new Date(+this) : this._d;
        },
        toISOString: function() {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
            } else {
                return formatMoment(m, "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
            }
        },
        toArray: function() {
            var m = this;
            return [ m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds() ];
        },
        isValid: function() {
            return isValid(this);
        },
        isDSTShifted: function() {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }
            return false;
        },
        parsingFlags: function() {
            return extend({}, this._pf);
        },
        invalidAt: function() {
            return this._pf.overflow;
        },
        utc: function() {
            return this.zone(0);
        },
        local: function() {
            this.zone(0);
            this._isUTC = false;
            return this;
        },
        format: function(inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur;
            if (typeof input === "string") {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },
        subtract: function(input, val) {
            var dur;
            if (typeof input === "string") {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },
        diff: function(input, units, asFloat) {
            var that = makeAs(input, this), zoneDiff = (this.zone() - that.zone()) * 6e4, diff, output;
            units = normalizeUnits(units);
            if (units === "year" || units === "month") {
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5;
                output = (this.year() - that.year()) * 12 + (this.month() - that.month());
                output += (this - moment(this).startOf("month") - (that - moment(that).startOf("month"))) / diff;
                output -= (this.zone() - moment(this).startOf("month").zone() - (that.zone() - moment(that).startOf("month").zone())) * 6e4 / diff;
                if (units === "year") {
                    output = output / 12;
                }
            } else {
                diff = this - that;
                output = units === "second" ? diff / 1e3 : units === "minute" ? diff / 6e4 : units === "hour" ? diff / 36e5 : units === "day" ? (diff - zoneDiff) / 864e5 : units === "week" ? (diff - zoneDiff) / 6048e5 : diff;
            }
            return asFloat ? output : absRound(output);
        },
        from: function(time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },
        fromNow: function(withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },
        calendar: function() {
            var sod = makeAs(moment(), this).startOf("day"), diff = this.diff(sod, "days", true), format = diff < -6 ? "sameElse" : diff < -1 ? "lastWeek" : diff < 0 ? "lastDay" : diff < 1 ? "sameDay" : diff < 2 ? "nextDay" : diff < 7 ? "nextWeek" : "sameElse";
            return this.format(this.lang().calendar(format, this));
        },
        isLeapYear: function() {
            return isLeapYear(this.year());
        },
        isDST: function() {
            return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone();
        },
        day: function(input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.lang());
                return this.add({
                    d: input - day
                });
            } else {
                return day;
            }
        },
        month: makeAccessor("Month", true),
        startOf: function(units) {
            units = normalizeUnits(units);
            switch (units) {
              case "year":
                this.month(0);

              case "quarter":
              case "month":
                this.date(1);

              case "week":
              case "isoWeek":
              case "day":
                this.hours(0);

              case "hour":
                this.minutes(0);

              case "minute":
                this.seconds(0);

              case "second":
                this.milliseconds(0);
            }
            if (units === "week") {
                this.weekday(0);
            } else if (units === "isoWeek") {
                this.isoWeekday(1);
            }
            if (units === "quarter") {
                this.month(Math.floor(this.month() / 3) * 3);
            }
            return this;
        },
        endOf: function(units) {
            units = normalizeUnits(units);
            return this.startOf(units).add(units === "isoWeek" ? "week" : units, 1).subtract("ms", 1);
        },
        isAfter: function(input, units) {
            units = typeof units !== "undefined" ? units : "millisecond";
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },
        isBefore: function(input, units) {
            units = typeof units !== "undefined" ? units : "millisecond";
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },
        isSame: function(input, units) {
            units = units || "ms";
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },
        min: function(other) {
            other = moment.apply(null, arguments);
            return other < this ? this : other;
        },
        max: function(other) {
            other = moment.apply(null, arguments);
            return other > this ? this : other;
        },
        zone: function(input, keepTime) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    if (!keepTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this, moment.duration(offset - input, "m"), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },
        zoneAbbr: function() {
            return this._isUTC ? "UTC" : "";
        },
        zoneName: function() {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },
        parseZone: function() {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === "string") {
                this.zone(this._i);
            }
            return this;
        },
        hasAlignedHourOffset: function(input) {
            if (!input) {
                input = 0;
            } else {
                input = moment(input).zone();
            }
            return (this.zone() - input) % 60 === 0;
        },
        daysInMonth: function() {
            return daysInMonth(this.year(), this.month());
        },
        dayOfYear: function(input) {
            var dayOfYear = round((moment(this).startOf("day") - moment(this).startOf("year")) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", input - dayOfYear);
        },
        quarter: function(input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },
        weekYear: function(input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", input - year);
        },
        isoWeekYear: function(input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", input - year);
        },
        week: function(input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },
        isoWeek: function(input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },
        weekday: function(input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },
        isoWeekday: function(input) {
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },
        isoWeeksInYear: function() {
            return weeksInYear(this.year(), 1, 4);
        },
        weeksInYear: function() {
            var weekInfo = this._lang._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },
        get: function(units) {
            units = normalizeUnits(units);
            return this[units]();
        },
        set: function(units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === "function") {
                this[units](value);
            }
            return this;
        },
        lang: function(key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    });
    function rawMonthSetter(mom, value) {
        var dayOfMonth;
        if (typeof value === "string") {
            value = mom.lang().monthsParse(value);
            if (typeof value !== "number") {
                return mom;
            }
        }
        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d["set" + (mom._isUTC ? "UTC" : "") + "Month"](value, dayOfMonth);
        return mom;
    }
    function rawGetter(mom, unit) {
        return mom._d["get" + (mom._isUTC ? "UTC" : "") + unit]();
    }
    function rawSetter(mom, unit, value) {
        if (unit === "Month") {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d["set" + (mom._isUTC ? "UTC" : "") + unit](value);
        }
    }
    function makeAccessor(unit, keepTime) {
        return function(value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }
    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor("Milliseconds", false);
    moment.fn.second = moment.fn.seconds = makeAccessor("Seconds", false);
    moment.fn.minute = moment.fn.minutes = makeAccessor("Minutes", false);
    moment.fn.hour = moment.fn.hours = makeAccessor("Hours", true);
    moment.fn.date = makeAccessor("Date", true);
    moment.fn.dates = deprecate("dates accessor is deprecated. Use date instead.", makeAccessor("Date", true));
    moment.fn.year = makeAccessor("FullYear", true);
    moment.fn.years = deprecate("years accessor is deprecated. Use year instead.", makeAccessor("FullYear", true));
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;
    moment.fn.toJSON = moment.fn.toISOString;
    extend(moment.duration.fn = Duration.prototype, {
        _bubble: function() {
            var milliseconds = this._milliseconds, days = this._days, months = this._months, data = this._data, seconds, minutes, hours, years;
            data.milliseconds = milliseconds % 1e3;
            seconds = absRound(milliseconds / 1e3);
            data.seconds = seconds % 60;
            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;
            hours = absRound(minutes / 60);
            data.hours = hours % 24;
            days += absRound(hours / 24);
            data.days = days % 30;
            months += absRound(days / 30);
            data.months = months % 12;
            years = absRound(months / 12);
            data.years = years;
        },
        weeks: function() {
            return absRound(this.days() / 7);
        },
        valueOf: function() {
            return this._milliseconds + this._days * 864e5 + this._months % 12 * 2592e6 + toInt(this._months / 12) * 31536e6;
        },
        humanize: function(withSuffix) {
            var difference = +this, output = relativeTime(difference, !withSuffix, this.lang());
            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }
            return this.lang().postformat(output);
        },
        add: function(input, val) {
            var dur = moment.duration(input, val);
            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;
            this._bubble();
            return this;
        },
        subtract: function(input, val) {
            var dur = moment.duration(input, val);
            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;
            this._bubble();
            return this;
        },
        get: function(units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + "s"]();
        },
        as: function(units) {
            units = normalizeUnits(units);
            return this["as" + units.charAt(0).toUpperCase() + units.slice(1) + "s"]();
        },
        lang: moment.fn.lang,
        toIsoString: function() {
            var years = Math.abs(this.years()), months = Math.abs(this.months()), days = Math.abs(this.days()), hours = Math.abs(this.hours()), minutes = Math.abs(this.minutes()), seconds = Math.abs(this.seconds() + this.milliseconds() / 1e3);
            if (!this.asSeconds()) {
                return "P0D";
            }
            return (this.asSeconds() < 0 ? "-" : "") + "P" + (years ? years + "Y" : "") + (months ? months + "M" : "") + (days ? days + "D" : "") + (hours || minutes || seconds ? "T" : "") + (hours ? hours + "H" : "") + (minutes ? minutes + "M" : "") + (seconds ? seconds + "S" : "");
        }
    });
    function makeDurationGetter(name) {
        moment.duration.fn[name] = function() {
            return this._data[name];
        };
    }
    function makeDurationAsGetter(name, factor) {
        moment.duration.fn["as" + name] = function() {
            return +this / factor;
        };
    }
    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }
    makeDurationAsGetter("Weeks", 6048e5);
    moment.duration.fn.asMonths = function() {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };
    moment.lang("en", {
        ordinal: function(number) {
            var b = number % 10, output = toInt(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
            return number + output;
        }
    });
    function makeGlobal(shouldDeprecate) {
        if (typeof ender !== "undefined") {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate("Accessing Moment through the global scope is " + "deprecated, and will be removed in an upcoming " + "release.", moment);
        } else {
            globalScope.moment = moment;
        }
    }
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === "function" && define.amd) {
        define("moment", function(require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                globalScope.moment = oldGlobalMoment;
            }
            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

(function(factory) {
    if (typeof define === "function" && define.amd) {
        define([ "moment" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("../moment"));
    } else {
        factory(window.moment);
    }
})(function(moment) {
    return moment.lang("zh-cn", {
        months: "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
        monthsShort: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
        weekdays: "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
        weekdaysShort: "周日_周一_周二_周三_周四_周五_周六".split("_"),
        weekdaysMin: "日_一_二_三_四_五_六".split("_"),
        longDateFormat: {
            LT: "Ah点mm",
            L: "YYYY-MM-DD",
            LL: "YYYY年MMMD日",
            LLL: "YYYY年MMMD日LT",
            LLLL: "YYYY年MMMD日ddddLT",
            l: "YYYY-MM-DD",
            ll: "YYYY年MMMD日",
            lll: "YYYY年MMMD日LT",
            llll: "YYYY年MMMD日ddddLT"
        },
        meridiem: function(hour, minute, isLower) {
            var hm = hour * 100 + minute;
            if (hm < 600) {
                return "凌晨";
            } else if (hm < 900) {
                return "早上";
            } else if (hm < 1130) {
                return "上午";
            } else if (hm < 1230) {
                return "中午";
            } else if (hm < 1800) {
                return "下午";
            } else {
                return "晚上";
            }
        },
        calendar: {
            sameDay: function() {
                return this.minutes() === 0 ? "[今天]Ah[点整]" : "[今天]LT";
            },
            nextDay: function() {
                return this.minutes() === 0 ? "[明天]Ah[点整]" : "[明天]LT";
            },
            lastDay: function() {
                return this.minutes() === 0 ? "[昨天]Ah[点整]" : "[昨天]LT";
            },
            nextWeek: function() {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf("week");
                prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? "[下]" : "[本]";
                return this.minutes() === 0 ? prefix + "dddAh点整" : prefix + "dddAh点mm";
            },
            lastWeek: function() {
                var startOfWeek, prefix;
                startOfWeek = moment().startOf("week");
                prefix = this.unix() < startOfWeek.unix() ? "[上]" : "[本]";
                return this.minutes() === 0 ? prefix + "dddAh点整" : prefix + "dddAh点mm";
            },
            sameElse: "LL"
        },
        ordinal: function(number, period) {
            switch (period) {
              case "d":
              case "D":
              case "DDD":
                return number + "日";

              case "M":
                return number + "月";

              case "w":
              case "W":
                return number + "周";

              default:
                return number;
            }
        },
        relativeTime: {
            future: "%s内",
            past: "%s前",
            s: "几秒",
            m: "1分钟",
            mm: "%d分钟",
            h: "1小时",
            hh: "%d小时",
            d: "1天",
            dd: "%d天",
            M: "1个月",
            MM: "%d个月",
            y: "1年",
            yy: "%d年"
        },
        week: {
            dow: 1,
            doy: 4
        }
    });
});

!function($, moment) {
    var DateRangePicker = function(element, options, cb) {
        this.parentEl = "body";
        this.element = $(element);
        var DRPTemplate = '<div class="daterangepicker dropdown-menu">' + '<div class="calendar left"></div>' + '<div class="calendar right"></div>' + '<div class="ranges">' + '<div class="range_inputs">' + '<div class="daterangepicker_start_input">' + '<label for="daterangepicker_start"></label>' + '<input class="input-mini" type="text" name="daterangepicker_start" value="" disabled="disabled" />' + "</div>" + '<div class="daterangepicker_end_input">' + '<label for="daterangepicker_end"></label>' + '<input class="input-mini" type="text" name="daterangepicker_end" value="" disabled="disabled" />' + "</div>" + '<button class="applyBtn" disabled="disabled"></button>&nbsp;' + '<button class="cancelBtn"></button>' + "</div>" + "</div>" + "</div>";
        if (typeof options !== "object" || options === null) options = {};
        this.parentEl = typeof options === "object" && options.parentEl && $(options.parentEl).length ? $(options.parentEl) : $(this.parentEl);
        this.container = $(DRPTemplate).appendTo(this.parentEl);
        this.setOptions(options, cb);
        var c = this.container;
        $.each(this.buttonClasses, function(idx, val) {
            c.find("button").addClass(val);
        });
        this.container.find(".daterangepicker_start_input label").html(this.locale.fromLabel);
        this.container.find(".daterangepicker_end_input label").html(this.locale.toLabel);
        if (this.applyClass.length) this.container.find(".applyBtn").addClass(this.applyClass);
        if (this.cancelClass.length) this.container.find(".cancelBtn").addClass(this.cancelClass);
        this.container.find(".applyBtn").html(this.locale.applyLabel);
        this.container.find(".cancelBtn").html(this.locale.cancelLabel);
        this.container.find(".calendar").on("click.daterangepicker", ".prev", $.proxy(this.clickPrev, this)).on("click.daterangepicker", ".next", $.proxy(this.clickNext, this)).on("click.daterangepicker", "td.available", $.proxy(this.clickDate, this)).on("mouseenter.daterangepicker", "td.available", $.proxy(this.enterDate, this)).on("mouseleave.daterangepicker", "td.available", $.proxy(this.updateFormInputs, this)).on("change.daterangepicker", "select.yearselect", $.proxy(this.updateMonthYear, this)).on("change.daterangepicker", "select.monthselect", $.proxy(this.updateMonthYear, this)).on("change.daterangepicker", "select.hourselect,select.minuteselect,select.ampmselect", $.proxy(this.updateTime, this));
        this.container.find(".ranges").on("click.daterangepicker", "button.applyBtn", $.proxy(this.clickApply, this)).on("click.daterangepicker", "button.cancelBtn", $.proxy(this.clickCancel, this)).on("click.daterangepicker", ".daterangepicker_start_input,.daterangepicker_end_input", $.proxy(this.showCalendars, this)).on("click.daterangepicker", "li", $.proxy(this.clickRange, this)).on("mouseenter.daterangepicker", "li", $.proxy(this.enterRange, this)).on("mouseleave.daterangepicker", "li", $.proxy(this.updateFormInputs, this));
        if (this.element.is("input")) {
            this.element.on({
                "click.daterangepicker": $.proxy(this.show, this),
                "focus.daterangepicker": $.proxy(this.show, this),
                "keyup.daterangepicker": $.proxy(this.updateFromControl, this)
            });
        } else {
            this.element.on("click.daterangepicker", $.proxy(this.toggle, this));
        }
    };
    DateRangePicker.prototype = {
        constructor: DateRangePicker,
        setOptions: function(options, callback) {
            this.startDate = moment().startOf("day");
            this.endDate = moment().endOf("day");
            this.minDate = false;
            this.maxDate = false;
            this.dateLimit = false;
            this.showDropdowns = false;
            this.showWeekNumbers = false;
            this.timePicker = false;
            this.timePickerIncrement = 30;
            this.timePicker12Hour = true;
            this.singleDatePicker = false;
            this.ranges = {};
            this.opens = "right";
            if (this.element.hasClass("pull-right")) this.opens = "left";
            this.buttonClasses = [ "btn", "btn-small" ];
            this.applyClass = "btn-success";
            this.cancelClass = "btn-default";
            this.format = "MM/DD/YYYY";
            this.separator = " - ";
            this.locale = {
                applyLabel: "Apply",
                cancelLabel: "Cancel",
                fromLabel: "From",
                toLabel: "To",
                weekLabel: "W",
                customRangeLabel: "Custom Range",
                daysOfWeek: moment()._lang._weekdaysMin.slice(),
                monthNames: moment()._lang._monthsShort.slice(),
                firstDay: 0
            };
            this.cb = function() {};
            if (typeof options.format === "string") this.format = options.format;
            if (typeof options.separator === "string") this.separator = options.separator;
            if (typeof options.startDate === "string") this.startDate = moment(options.startDate, this.format);
            if (typeof options.endDate === "string") this.endDate = moment(options.endDate, this.format);
            if (typeof options.minDate === "string") this.minDate = moment(options.minDate, this.format);
            if (typeof options.maxDate === "string") this.maxDate = moment(options.maxDate, this.format);
            if (typeof options.startDate === "object") this.startDate = moment(options.startDate);
            if (typeof options.endDate === "object") this.endDate = moment(options.endDate);
            if (typeof options.minDate === "object") this.minDate = moment(options.minDate);
            if (typeof options.maxDate === "object") this.maxDate = moment(options.maxDate);
            if (typeof options.applyClass === "string") this.applyClass = options.applyClass;
            if (typeof options.cancelClass === "string") this.cancelClass = options.cancelClass;
            if (typeof options.dateLimit === "object") this.dateLimit = options.dateLimit;
            if (typeof options.locale === "object") {
                if (typeof options.locale.daysOfWeek === "object") {
                    this.locale.daysOfWeek = options.locale.daysOfWeek.slice();
                }
                if (typeof options.locale.monthNames === "object") {
                    this.locale.monthNames = options.locale.monthNames.slice();
                }
                if (typeof options.locale.firstDay === "number") {
                    this.locale.firstDay = options.locale.firstDay;
                    var iterator = options.locale.firstDay;
                    while (iterator > 0) {
                        this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                        iterator--;
                    }
                }
                if (typeof options.locale.applyLabel === "string") {
                    this.locale.applyLabel = options.locale.applyLabel;
                }
                if (typeof options.locale.cancelLabel === "string") {
                    this.locale.cancelLabel = options.locale.cancelLabel;
                }
                if (typeof options.locale.fromLabel === "string") {
                    this.locale.fromLabel = options.locale.fromLabel;
                }
                if (typeof options.locale.toLabel === "string") {
                    this.locale.toLabel = options.locale.toLabel;
                }
                if (typeof options.locale.weekLabel === "string") {
                    this.locale.weekLabel = options.locale.weekLabel;
                }
                if (typeof options.locale.customRangeLabel === "string") {
                    this.locale.customRangeLabel = options.locale.customRangeLabel;
                }
            }
            if (typeof options.opens === "string") this.opens = options.opens;
            if (typeof options.showWeekNumbers === "boolean") {
                this.showWeekNumbers = options.showWeekNumbers;
            }
            if (typeof options.buttonClasses === "string") {
                this.buttonClasses = [ options.buttonClasses ];
            }
            if (typeof options.buttonClasses === "object") {
                this.buttonClasses = options.buttonClasses;
            }
            if (typeof options.showDropdowns === "boolean") {
                this.showDropdowns = options.showDropdowns;
            }
            if (typeof options.singleDatePicker === "boolean") {
                this.singleDatePicker = options.singleDatePicker;
            }
            if (typeof options.timePicker === "boolean") {
                this.timePicker = options.timePicker;
            }
            if (typeof options.timePickerIncrement === "number") {
                this.timePickerIncrement = options.timePickerIncrement;
            }
            if (typeof options.timePicker12Hour === "boolean") {
                this.timePicker12Hour = options.timePicker12Hour;
            }
            var start, end, range;
            if (typeof options.startDate === "undefined" && typeof options.endDate === "undefined") {
                if ($(this.element).is("input[type=text]")) {
                    var val = $(this.element).val();
                    var split = val.split(this.separator);
                    start = end = null;
                    if (split.length == 2) {
                        start = moment(split[0], this.format);
                        end = moment(split[1], this.format);
                    } else if (this.singleDatePicker) {
                        start = moment(val, this.format);
                        end = moment(val, this.format);
                    }
                    if (start !== null && end !== null) {
                        this.startDate = start;
                        this.endDate = end;
                    }
                }
            }
            if (typeof options.ranges === "object") {
                for (range in options.ranges) {
                    start = moment(options.ranges[range][0]);
                    end = moment(options.ranges[range][1]);
                    if (this.minDate && start.isBefore(this.minDate)) start = moment(this.minDate);
                    if (this.maxDate && end.isAfter(this.maxDate)) end = moment(this.maxDate);
                    if (this.minDate && end.isBefore(this.minDate) || this.maxDate && start.isAfter(this.maxDate)) {
                        continue;
                    }
                    this.ranges[range] = [ start, end ];
                }
                var list = "<ul>";
                for (range in this.ranges) {
                    list += "<li>" + range + "</li>";
                }
                list += "<li>" + this.locale.customRangeLabel + "</li>";
                list += "</ul>";
                this.container.find(".ranges ul").remove();
                this.container.find(".ranges").prepend(list);
            }
            if (typeof callback === "function") {
                this.cb = callback;
            }
            if (!this.timePicker) {
                this.startDate = this.startDate.startOf("day");
                this.endDate = this.endDate.endOf("day");
            }
            if (this.singleDatePicker) {
                this.opens = "right";
                this.container.find(".calendar.right").show();
                this.container.find(".calendar.left").hide();
                this.container.find(".ranges").hide();
                if (!this.container.find(".calendar.right").hasClass("single")) this.container.find(".calendar.right").addClass("single");
            } else {
                this.container.find(".calendar.right").removeClass("single");
                this.container.find(".ranges").show();
            }
            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.oldChosenLabel = this.chosenLabel;
            this.leftCalendar = {
                month: moment([ this.startDate.year(), this.startDate.month(), 1, this.startDate.hour(), this.startDate.minute() ]),
                calendar: []
            };
            this.rightCalendar = {
                month: moment([ this.endDate.year(), this.endDate.month(), 1, this.endDate.hour(), this.endDate.minute() ]),
                calendar: []
            };
            if (this.opens == "right") {
                var left = this.container.find(".calendar.left");
                var right = this.container.find(".calendar.right");
                left.removeClass("left").addClass("right");
                right.removeClass("right").addClass("left");
            }
            if (typeof options.ranges === "undefined" && !this.singleDatePicker) {
                this.container.addClass("show-calendar");
            }
            this.container.addClass("opens" + this.opens);
            this.updateView();
            this.updateCalendars();
        },
        setStartDate: function(startDate) {
            if (typeof startDate === "string") this.startDate = moment(startDate, this.format);
            if (typeof startDate === "object") this.startDate = moment(startDate);
            if (!this.timePicker) this.startDate = this.startDate.startOf("day");
            this.oldStartDate = this.startDate.clone();
            this.updateView();
            this.updateCalendars();
        },
        setEndDate: function(endDate) {
            if (typeof endDate === "string") this.endDate = moment(endDate, this.format);
            if (typeof endDate === "object") this.endDate = moment(endDate);
            if (!this.timePicker) this.endDate = this.endDate.endOf("day");
            this.oldEndDate = this.endDate.clone();
            this.updateView();
            this.updateCalendars();
        },
        updateView: function() {
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateFormInputs();
        },
        updateFormInputs: function() {
            this.container.find("input[name=daterangepicker_start]").val(this.startDate.format(this.format));
            this.container.find("input[name=daterangepicker_end]").val(this.endDate.format(this.format));
            if (this.startDate.isSame(this.endDate) || this.startDate.isBefore(this.endDate)) {
                this.container.find("button.applyBtn").removeAttr("disabled");
            } else {
                this.container.find("button.applyBtn").attr("disabled", "disabled");
            }
        },
        updateFromControl: function() {
            if (!this.element.is("input")) return;
            if (!this.element.val().length) return;
            var dateString = this.element.val().split(this.separator), start = null, end = null;
            if (dateString.length === 2) {
                start = moment(dateString[0], this.format);
                end = moment(dateString[1], this.format);
            }
            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.format);
                end = start;
            }
            if (end.isBefore(start)) return;
            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.startDate = start;
            this.endDate = end;
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate)) this.notify();
            this.updateCalendars();
        },
        notify: function() {
            this.updateView();
            this.cb(this.startDate, this.endDate, this.chosenLabel);
        },
        move: function() {
            var parentOffset = {
                top: 0,
                left: 0
            };
            if (!this.parentEl.is("body")) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
            }
            if (this.opens == "left") {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    right: $(window).width() - this.element.offset().left - this.element.outerWidth() - parentOffset.left,
                    left: "auto"
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: "auto",
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: this.element.offset().top + this.element.outerHeight() - parentOffset.top,
                    left: this.element.offset().left - parentOffset.left,
                    right: "auto"
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: "auto",
                        right: 0
                    });
                }
            }
        },
        toggle: function(e) {
            if (this.element.hasClass("active")) {
                this.hide();
            } else {
                this.show();
            }
        },
        show: function(e) {
            this.element.addClass("active");
            this.container.show();
            this.move();
            this._outsideClickProxy = $.proxy(function(e) {
                this.outsideClick(e);
            }, this);
            $(document).on("mousedown.daterangepicker", this._outsideClickProxy).on("click.daterangepicker", "[data-toggle=dropdown]", this._outsideClickProxy).on("focusin.daterangepicker", this._outsideClickProxy);
            this.element.trigger("show.daterangepicker", this);
        },
        outsideClick: function(e) {
            var target = $(e.target);
            if (target.closest(this.element).length || target.closest(this.container).length || target.closest(".calendar-date").length) return;
            this.hide();
        },
        hide: function(e) {
            $(document).off("mousedown.daterangepicker", this._outsideClickProxy).off("click.daterangepicker", this._outsideClickProxy).off("focusin.daterangepicker", this._outsideClickProxy);
            this.element.removeClass("active");
            this.container.hide();
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate)) this.notify();
            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.element.trigger("hide.daterangepicker", this);
        },
        enterRange: function(e) {
            var label = e.target.innerHTML;
            if (label == this.locale.customRangeLabel) {
                this.updateView();
            } else {
                var dates = this.ranges[label];
                this.container.find("input[name=daterangepicker_start]").val(dates[0].format(this.format));
                this.container.find("input[name=daterangepicker_end]").val(dates[1].format(this.format));
            }
        },
        showCalendars: function() {
            this.container.addClass("show-calendar");
            this.move();
        },
        hideCalendars: function() {
            this.container.removeClass("show-calendar");
        },
        updateInputText: function() {
            if (this.element.is("input") && !this.singleDatePicker) {
                this.element.val(this.startDate.format(this.format) + this.separator + this.endDate.format(this.format));
            } else if (this.element.is("input")) {
                this.element.val(this.startDate.format(this.format));
            }
        },
        clickRange: function(e) {
            var label = e.target.innerHTML;
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];
                if (!this.timePicker) {
                    this.startDate.startOf("day");
                    this.endDate.endOf("day");
                }
                this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year()).hour(this.startDate.hour()).minute(this.startDate.minute());
                this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year()).hour(this.endDate.hour()).minute(this.endDate.minute());
                this.updateCalendars();
                this.updateInputText();
                this.hideCalendars();
                this.hide();
                this.element.trigger("apply.daterangepicker", this);
            }
        },
        clickPrev: function(e) {
            var cal = $(e.target).parents(".calendar");
            if (cal.hasClass("left")) {
                this.leftCalendar.month.subtract("month", 1);
            } else {
                this.rightCalendar.month.subtract("month", 1);
            }
            this.updateCalendars();
        },
        clickNext: function(e) {
            var cal = $(e.target).parents(".calendar");
            if (cal.hasClass("left")) {
                this.leftCalendar.month.add("month", 1);
            } else {
                this.rightCalendar.month.add("month", 1);
            }
            this.updateCalendars();
        },
        enterDate: function(e) {
            var title = $(e.target).attr("data-title");
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents(".calendar");
            if (cal.hasClass("left")) {
                this.container.find("input[name=daterangepicker_start]").val(this.leftCalendar.calendar[row][col].format(this.format));
            } else {
                this.container.find("input[name=daterangepicker_end]").val(this.rightCalendar.calendar[row][col].format(this.format));
            }
        },
        clickDate: function(e) {
            var title = $(e.target).attr("data-title");
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents(".calendar");
            var startDate, endDate;
            if (cal.hasClass("left")) {
                startDate = this.leftCalendar.calendar[row][col];
                endDate = this.endDate;
                if (typeof this.dateLimit === "object") {
                    var maxDate = moment(startDate).add(this.dateLimit).startOf("day");
                    if (endDate.isAfter(maxDate)) {
                        endDate = maxDate;
                    }
                }
            } else {
                startDate = this.startDate;
                endDate = this.rightCalendar.calendar[row][col];
                if (typeof this.dateLimit === "object") {
                    var minDate = moment(endDate).subtract(this.dateLimit).startOf("day");
                    if (startDate.isBefore(minDate)) {
                        startDate = minDate;
                    }
                }
            }
            if (this.singleDatePicker && cal.hasClass("left")) {
                endDate = startDate.clone();
            } else if (this.singleDatePicker && cal.hasClass("right")) {
                startDate = endDate.clone();
            }
            cal.find("td").removeClass("active");
            if (startDate.isSame(endDate) || startDate.isBefore(endDate)) {
                $(e.target).addClass("active");
                this.startDate = startDate;
                this.endDate = endDate;
                this.chosenLabel = this.locale.customRangeLabel;
            } else if (startDate.isAfter(endDate)) {
                $(e.target).addClass("active");
                var difference = this.endDate.diff(this.startDate);
                this.startDate = startDate;
                this.endDate = moment(startDate).add("ms", difference);
                this.chosenLabel = this.locale.customRangeLabel;
            }
            this.leftCalendar.month.month(this.startDate.month()).year(this.startDate.year());
            this.rightCalendar.month.month(this.endDate.month()).year(this.endDate.year());
            this.updateCalendars();
            if (!this.timePicker) endDate.endOf("day");
            if (this.singleDatePicker) this.clickApply();
        },
        clickApply: function(e) {
            this.updateInputText();
            this.hide();
            this.element.trigger("apply.daterangepicker", this);
        },
        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.chosenLabel = this.oldChosenLabel;
            this.updateView();
            this.updateCalendars();
            this.hide();
            this.element.trigger("cancel.daterangepicker", this);
        },
        updateMonthYear: function(e) {
            var isLeft = $(e.target).closest(".calendar").hasClass("left"), leftOrRight = isLeft ? "left" : "right", cal = this.container.find(".calendar." + leftOrRight);
            var month = parseInt(cal.find(".monthselect").val(), 10);
            var year = cal.find(".yearselect").val();
            this[leftOrRight + "Calendar"].month.month(month).year(year);
            this.updateCalendars();
        },
        updateTime: function(e) {
            var cal = $(e.target).closest(".calendar"), isLeft = cal.hasClass("left");
            var hour = parseInt(cal.find(".hourselect").val(), 10);
            var minute = parseInt(cal.find(".minuteselect").val(), 10);
            if (this.timePicker12Hour) {
                var ampm = cal.find(".ampmselect").val();
                if (ampm === "PM" && hour < 12) hour += 12;
                if (ampm === "AM" && hour === 12) hour = 0;
            }
            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                this.startDate = start;
                this.leftCalendar.month.hour(hour).minute(minute);
            } else {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                this.endDate = end;
                this.rightCalendar.month.hour(hour).minute(minute);
            }
            this.updateCalendars();
        },
        updateCalendars: function() {
            this.leftCalendar.calendar = this.buildCalendar(this.leftCalendar.month.month(), this.leftCalendar.month.year(), this.leftCalendar.month.hour(), this.leftCalendar.month.minute(), "left");
            this.rightCalendar.calendar = this.buildCalendar(this.rightCalendar.month.month(), this.rightCalendar.month.year(), this.rightCalendar.month.hour(), this.rightCalendar.month.minute(), "right");
            this.container.find(".calendar.left").empty().html(this.renderCalendar(this.leftCalendar.calendar, this.startDate, this.minDate, this.maxDate));
            this.container.find(".calendar.right").empty().html(this.renderCalendar(this.rightCalendar.calendar, this.endDate, this.startDate, this.maxDate));
            this.container.find(".ranges li").removeClass("active");
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
                if (this.timePicker) {
                    if (this.startDate.isSame(this.ranges[range][0]) && this.endDate.isSame(this.ranges[range][1])) {
                        customRange = false;
                        this.chosenLabel = this.container.find(".ranges li:eq(" + i + ")").addClass("active").html();
                    }
                } else {
                    if (this.startDate.format("YYYY-MM-DD") == this.ranges[range][0].format("YYYY-MM-DD") && this.endDate.format("YYYY-MM-DD") == this.ranges[range][1].format("YYYY-MM-DD")) {
                        customRange = false;
                        this.chosenLabel = this.container.find(".ranges li:eq(" + i + ")").addClass("active").html();
                    }
                }
                i++;
            }
            if (customRange) {
                this.chosenLabel = this.container.find(".ranges li:last").addClass("active").html();
            }
        },
        buildCalendar: function(month, year, hour, minute, side) {
            var firstDay = moment([ year, month, 1 ]);
            var lastMonth = moment(firstDay).subtract("month", 1).month();
            var lastYear = moment(firstDay).subtract("month", 1).year();
            var daysInLastMonth = moment([ lastYear, lastMonth ]).daysInMonth();
            var dayOfWeek = firstDay.day();
            var i;
            var calendar = [];
            for (i = 0; i < 6; i++) {
                calendar[i] = [];
            }
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth) startDay -= 7;
            if (dayOfWeek == this.locale.firstDay) startDay = daysInLastMonth - 6;
            var curDate = moment([ lastYear, lastMonth, startDay, 12, minute ]);
            var col, row;
            for (i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add("hour", 24)) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour);
                curDate.hour(12);
            }
            return calendar;
        },
        renderDropdowns: function(selected, minDate, maxDate) {
            var currentMonth = selected.month();
            var monthHtml = '<select class="monthselect">';
            var inMinYear = false;
            var inMaxYear = false;
            for (var m = 0; m < 12; m++) {
                if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                    monthHtml += "<option value='" + m + "'" + (m === currentMonth ? " selected='selected'" : "") + ">" + this.locale.monthNames[m] + "</option>";
                }
            }
            monthHtml += "</select>";
            var currentYear = selected.year();
            var maxYear = maxDate && maxDate.year() || currentYear + 5;
            var minYear = minDate && minDate.year() || currentYear - 50;
            var yearHtml = '<select class="yearselect">';
            for (var y = minYear; y <= maxYear; y++) {
                yearHtml += '<option value="' + y + '"' + (y === currentYear ? ' selected="selected"' : "") + ">" + y + "</option>";
            }
            yearHtml += "</select>";
            return monthHtml + yearHtml;
        },
        renderCalendar: function(calendar, selected, minDate, maxDate) {
            var html = '<div class="calendar-date">';
            html += '<table class="table-condensed">';
            html += "<thead>";
            html += "<tr>";
            if (this.showWeekNumbers) html += "<th></th>";
            if (!minDate || minDate.isBefore(calendar[1][1])) {
                html += '<th class="prev available"><i class="fa fa-arrow-left icon-arrow-left glyphicon glyphicon-arrow-left"></i></th>';
            } else {
                html += "<th></th>";
            }
            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");
            if (this.showDropdowns) {
                dateHtml = this.renderDropdowns(calendar[1][1], minDate, maxDate);
            }
            html += '<th colspan="5" class="month">' + dateHtml + "</th>";
            if (!maxDate || maxDate.isAfter(calendar[1][1])) {
                html += '<th class="next available"><i class="fa fa-arrow-right icon-arrow-right glyphicon glyphicon-arrow-right"></i></th>';
            } else {
                html += "<th></th>";
            }
            html += "</tr>";
            html += "<tr>";
            if (this.showWeekNumbers) html += '<th class="week">' + this.locale.weekLabel + "</th>";
            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += "<th>" + dayOfWeek + "</th>";
            });
            html += "</tr>";
            html += "</thead>";
            html += "<tbody>";
            for (var row = 0; row < 6; row++) {
                html += "<tr>";
                if (this.showWeekNumbers) html += '<td class="week">' + calendar[row][0].week() + "</td>";
                for (var col = 0; col < 7; col++) {
                    var cname = "available ";
                    cname += calendar[row][col].month() == calendar[1][1].month() ? "" : "off";
                    if (minDate && calendar[row][col].isBefore(minDate, "day") || maxDate && calendar[row][col].isAfter(maxDate, "day")) {
                        cname = " off disabled ";
                    } else if (calendar[row][col].format("YYYY-MM-DD") == selected.format("YYYY-MM-DD")) {
                        cname += " active ";
                        if (calendar[row][col].format("YYYY-MM-DD") == this.startDate.format("YYYY-MM-DD")) {
                            cname += " start-date ";
                        }
                        if (calendar[row][col].format("YYYY-MM-DD") == this.endDate.format("YYYY-MM-DD")) {
                            cname += " end-date ";
                        }
                    } else if (calendar[row][col] >= this.startDate && calendar[row][col] <= this.endDate) {
                        cname += " in-range ";
                        if (calendar[row][col].isSame(this.startDate)) {
                            cname += " start-date ";
                        }
                        if (calendar[row][col].isSame(this.endDate)) {
                            cname += " end-date ";
                        }
                    }
                    var title = "r" + row + "c" + col;
                    html += '<td class="' + cname.replace(/\s+/g, " ").replace(/^\s?(.*?)\s?$/, "$1") + '" data-title="' + title + '">' + calendar[row][col].date() + "</td>";
                }
                html += "</tr>";
            }
            html += "</tbody>";
            html += "</table>";
            html += "</div>";
            var i;
            if (this.timePicker) {
                html += '<div class="calendar-time">';
                html += '<select class="hourselect">';
                var start = 0;
                var end = 23;
                var selected_hour = selected.hour();
                if (this.timePicker12Hour) {
                    start = 1;
                    end = 12;
                    if (selected_hour >= 12) selected_hour -= 12;
                    if (selected_hour === 0) selected_hour = 12;
                }
                for (i = start; i <= end; i++) {
                    if (i == selected_hour) {
                        html += '<option value="' + i + '" selected="selected">' + i + "</option>";
                    } else {
                        html += '<option value="' + i + '">' + i + "</option>";
                    }
                }
                html += "</select> : ";
                html += '<select class="minuteselect">';
                for (i = 0; i < 60; i += this.timePickerIncrement) {
                    var num = i;
                    if (num < 10) num = "0" + num;
                    if (i == selected.minute()) {
                        html += '<option value="' + i + '" selected="selected">' + num + "</option>";
                    } else {
                        html += '<option value="' + i + '">' + num + "</option>";
                    }
                }
                html += "</select> ";
                if (this.timePicker12Hour) {
                    html += '<select class="ampmselect">';
                    if (selected.hour() >= 12) {
                        html += '<option value="AM">AM</option><option value="PM" selected="selected">PM</option>';
                    } else {
                        html += '<option value="AM" selected="selected">AM</option><option value="PM">PM</option>';
                    }
                    html += "</select>";
                }
                html += "</div>";
            }
            return html;
        },
        remove: function() {
            this.container.remove();
            this.element.off(".daterangepicker");
            this.element.removeData("daterangepicker");
        }
    };
    $.fn.daterangepicker = function(options, cb) {
        this.each(function() {
            var el = $(this);
            if (el.data("daterangepicker")) el.data("daterangepicker").remove();
            el.data("daterangepicker", new DateRangePicker(el, options, cb));
        });
        return this;
    };
}(window.jQuery, window.moment);

(function() {
    function flashService($rootScope) {
        return {
            notify: function(message, isFlash) {
                if (isFlash) {
                    $rootScope.$emit("event:flashMessageEvent", message);
                } else {
                    $rootScope.$emit("event:notification", message);
                }
            }
        };
    }
    angular.module("ntd.services", []).factory("flash", [ "$rootScope", flashService ]);
})();

(function() {
    "use strict";
    function flashMessageService($rootScope) {
        return {
            notify: function(message) {
                $rootScope.$emit("event:flashMessageEvent", message);
            }
        };
    }
    angular.module("ntd.services").factory("flashMessage", [ "$rootScope", flashMessageService ]);
})();

"use strict";

angular.module("ntd.config", []).value("$ntdConfig", {});

angular.module("ntd.directives", [ "ntd.config", "ngSanitize" ]);

(function(ng, app) {
    "use strict";
    var ModalDecorator = function($provide) {
        var modalStackFactory = function($delegate, $transition, $timeout, $document, $compile, $rootScope, $$stackedMap) {
            var modalStack = $delegate;
            var OPENED_MODAL_CLASS = "modal-open";
            var backdropDomEl, backdropScope;
            var openedWindows = $$stackedMap.createNew();
            var $modalStack = {};
            function backdropIndex() {
                var topBackdropIndex = -1;
                var opened = openedWindows.keys();
                for (var i = 0; i < opened.length; i++) {
                    if (openedWindows.get(opened[i]).value.backdrop) {
                        topBackdropIndex = i;
                    }
                }
                return topBackdropIndex;
            }
            $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
                if (backdropScope) {
                    backdropScope.index = newBackdropIndex;
                }
            });
            function removeModalWindow(modalInstance) {
                var body = $document.find("body").eq(0);
                var modalWindow = openedWindows.get(modalInstance).value;
                openedWindows.remove(modalInstance);
                removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, 300, checkRemoveBackdrop);
                body.toggleClass(OPENED_MODAL_CLASS, openedWindows.length() > 0);
            }
            function checkRemoveBackdrop() {
                if (backdropDomEl && backdropIndex() == -1) {
                    var backdropScopeRef = backdropScope;
                    removeAfterAnimate(backdropDomEl, backdropScope, 150, function() {
                        backdropScopeRef.$destroy();
                        backdropScopeRef = null;
                    });
                    backdropDomEl = undefined;
                    backdropScope = undefined;
                }
            }
            function removeAfterAnimate(domEl, scope, emulateTime, done) {
                scope.animate = false;
                var transitionEndEventName = $transition.transitionEndEventName;
                if (transitionEndEventName) {
                    var timeout = $timeout(afterAnimating, emulateTime);
                    domEl.bind(transitionEndEventName, function() {
                        $timeout.cancel(timeout);
                        afterAnimating();
                        scope.$apply();
                    });
                } else {
                    $timeout(afterAnimating, 0);
                }
                function afterAnimating() {
                    if (afterAnimating.done) {
                        return;
                    }
                    afterAnimating.done = true;
                    domEl.remove();
                    if (done) {
                        done();
                    }
                }
            }
            $document.bind("keydown", function(evt) {
                var modal;
                if (evt.which === 27) {
                    modal = openedWindows.top();
                    if (modal && modal.value.keyboard) {
                        $rootScope.$apply(function() {
                            modalStack.dismiss(modal.key);
                        });
                    }
                }
            });
            modalStack.init = function(modalInstance, modal) {
                openedWindows.add(modalInstance, {
                    deferred: modal.deferred,
                    modalScope: $rootScope,
                    backdrop: modal.backdrop,
                    keyboard: modal.keyboard
                });
                var body = $document.find("body").eq(0);
                var currBackdropIndex = backdropIndex();
                if (currBackdropIndex >= 0 && !backdropDomEl) {
                    backdropScope = $rootScope.$new(true);
                    backdropScope.index = currBackdropIndex;
                    backdropDomEl = $compile("<div modal-backdrop></div>")(backdropScope);
                    body.append(backdropDomEl);
                }
                var angularDomEl = angular.element("<div modal-window></div>");
                angularDomEl.attr("window-class", modal.windowClass);
                angularDomEl.attr("index", openedWindows.length() - 1);
                angularDomEl.attr("animate", "animate");
                angularDomEl.html(modal.content);
                var modalDomEl = $compile(angularDomEl)($rootScope);
                openedWindows.top().value.modalDomEl = modalDomEl;
                body.append(modalDomEl);
                body.addClass(OPENED_MODAL_CLASS);
            };
            modalStack.setContent = function(modalInstance, scope, content) {
                var opened = openedWindows.get(modalInstance);
                var contentDomEl = $compile(content)(scope);
                opened.value.modalScope = scope;
                $timeout(function() {
                    opened.value.modalDomEl.find(".modal-content").html(contentDomEl);
                });
            };
            modalStack.open = function(modalInstance, modal) {
                openedWindows.add(modalInstance, {
                    deferred: modal.deferred,
                    modalScope: modal.scope,
                    backdrop: modal.backdrop,
                    keyboard: modal.keyboard
                });
                var body = $document.find("body").eq(0);
                var currBackdropIndex = backdropIndex();
                if (currBackdropIndex >= 0 && !backdropDomEl) {
                    backdropScope = $rootScope.$new(true);
                    backdropScope.index = currBackdropIndex;
                    backdropDomEl = $compile("<div modal-backdrop></div>")(backdropScope);
                    body.append(backdropDomEl);
                }
                var angularDomEl = angular.element("<div modal-window></div>");
                angularDomEl.attr("window-class", modal.windowClass);
                angularDomEl.attr("index", openedWindows.length() - 1);
                angularDomEl.attr("animate", "animate");
                angularDomEl.html(modal.content);
                var modalDomEl = $compile(angularDomEl)(modal.scope);
                openedWindows.top().value.modalDomEl = modalDomEl;
                body.append(modalDomEl);
                body.addClass(OPENED_MODAL_CLASS);
            };
            modalStack.close = function(modalInstance, result) {
                var modalWindow = openedWindows.get(modalInstance).value;
                if (modalWindow) {
                    modalWindow.deferred.resolve(result);
                    removeModalWindow(modalInstance);
                }
            };
            modalStack.dismiss = function(modalInstance, reason) {
                var modalWindow = openedWindows.get(modalInstance).value;
                if (modalWindow) {
                    modalWindow.deferred.reject(reason);
                    removeModalWindow(modalInstance);
                }
            };
            modalStack.dismissAll = function(reason) {
                var topModal = this.getTop();
                while (topModal) {
                    this.dismiss(topModal.key, reason);
                    topModal = this.getTop();
                }
            };
            modalStack.getTop = function() {
                return openedWindows.top();
            };
            return modalStack;
        };
        $provide.decorator("$modalStack", [ "$delegate", "$transition", "$timeout", "$document", "$compile", "$rootScope", "$$stackedMap", modalStackFactory ]);
        var ModalProvider = function($delegate, $injector, $rootScope, $q, $http, $templateCache, $controller, $modalStack) {
            var modalProvider = ng.copy($delegate);
            var getTemplatePromise = function(options) {
                return options.template ? $q.when(options.template) : $http.get(options.templateUrl, {
                    cache: $templateCache
                }).then(function(result) {
                    return result.data;
                });
            };
            var getResolvePromises = function(resolves) {
                var promisesArr = [];
                angular.forEach(resolves, function(value, key) {
                    if (angular.isFunction(value) || angular.isArray(value)) {
                        promisesArr.push($q.when($injector.invoke(value)));
                    }
                });
                return promisesArr;
            };
            modalProvider.options = {
                backdrop: true,
                keyboard: true,
                loader: true
            };
            modalProvider.open = function(modalOptions) {
                var modalResultDeferred = $q.defer();
                var modalOpenedDeferred = $q.defer();
                var modalInstance = {
                    result: modalResultDeferred.promise,
                    opened: modalOpenedDeferred.promise,
                    close: function(result) {
                        $modalStack.close(modalInstance, result);
                    },
                    dismiss: function(reason) {
                        $modalStack.dismiss(modalInstance, reason);
                    }
                };
                modalOptions = angular.extend({}, modalProvider.options, modalOptions);
                modalOptions.resolve = modalOptions.resolve || {};
                if (!modalOptions.template && !modalOptions.templateUrl) {
                    throw new Error("One of template or templateUrl options is required.");
                }
                var templateAndResolvePromise = $q.all([ getTemplatePromise(modalOptions) ].concat(getResolvePromises(modalOptions.resolve)));
                if (modalOptions.loader) {
                    $modalStack.init(modalInstance, {
                        backdrop: modalOptions.backdrop,
                        keyboard: modalOptions.keyboard,
                        deferred: modalResultDeferred,
                        content: ng.element('<div class="modal-loading">' + '<img class="loading" src="images/w-ajax-loader.gif"' + ' alt="加载中" /></div>'),
                        windowClass: modalOptions.windowClass
                    });
                }
                templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {
                    var modalScope = (modalOptions.scope || $rootScope).$new();
                    modalScope.$close = modalInstance.close;
                    modalScope.$dismiss = modalInstance.dismiss;
                    var ctrlInstance, ctrlLocals = {};
                    var resolveIter = 1;
                    if (modalOptions.controller) {
                        ctrlLocals.$scope = modalScope;
                        ctrlLocals.$modalInstance = modalInstance;
                        angular.forEach(modalOptions.resolve, function(value, key) {
                            ctrlLocals[key] = tplAndVars[resolveIter++];
                        });
                        ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                    }
                    if (modalOptions.loader) {
                        $modalStack.setContent(modalInstance, modalScope, tplAndVars[0]);
                    } else {
                        $modalStack.open(modalInstance, {
                            scope: modalScope,
                            deferred: modalResultDeferred,
                            content: tplAndVars[0],
                            backdrop: modalOptions.backdrop,
                            keyboard: modalOptions.keyboard,
                            windowClass: modalOptions.windowClass
                        });
                    }
                }, function resolveError(reason) {
                    modalResultDeferred.reject(reason);
                });
                templateAndResolvePromise.then(function() {
                    modalOpenedDeferred.resolve(true);
                }, function() {
                    modalOpenedDeferred.reject(false);
                });
                return modalInstance;
            };
            return modalProvider;
        };
        $provide.decorator("$modal", [ "$delegate", "$injector", "$rootScope", "$q", "$http", "$templateCache", "$controller", "$modalStack", ModalProvider ]);
    };
    app.config([ "$provide", ModalDecorator ]);
})(angular, angular.module("ui.bootstrap.modal"));

(function(ng) {
    "use strict";
    var AdminuiFrame = function(adminuiFrameProvider, $rootScope, $location, $timeout, $modal, $http, $route, SYS, flash) {
        return {
            restrict: "A",
            templateUrl: "templates/adminui-frame.html",
            transclude: true,
            scope: {
                userInfo: "=",
                messages: "="
            },
            link: function(scope, elem, attrs) {
                scope.isSubMenuShow = adminuiFrameProvider.defaultShowSubmenu;
                scope.hasSideMenu = false;
                scope.noSideMenu = true;
                scope.hasSubNav = false;
                scope.isMessageBoxShow = adminuiFrameProvider.showMessageBox;
                scope.navigation = adminuiFrameProvider.navigation;
                scope.messages = scope.messages ? scope.messages : [];
                scope.commonMenus = [];
                scope.accountHost = null;
                scope.isInited = false;
                scope.userInfo = ng.extend({
                    username: null,
                    accessToken: null,
                    avatar: "images/avatar.jpg",
                    logout: function() {
                        console.log("logout");
                    },
                    changePwd: function() {
                        console.log("change password");
                    }
                }, scope.userInfo);
                scope.$watch("hasSubNav", function(value, oldValue) {
                    if (value == true) {
                        $("body").css("paddingTop", "100px");
                    }
                });
                scope.$watch("userInfo", function(value) {
                    if (scope.isInited && value.accessToken !== null) {
                        fetchCommonMenus($http, scope);
                    }
                }, true);
                initNav(scope, $http, $route, SYS, adminuiFrameProvider.navigation, $location.path());
                $rootScope.$on("$routeChangeStart", function() {
                    if (scope.isInited) {
                        selectPath(scope, $location.path());
                    }
                });
                $rootScope.$on("$routeChangeSuccess", function() {
                    if (scope.isInited) {
                        parseNavUrl(scope.navigation, $route);
                    }
                });
                scope.select = ng.bind(scope, select, $timeout, elem);
                scope.toggleSubMenu = ng.bind(scope, toggleSubMenu);
                scope.selectNav = ng.bind(scope, selectNav);
                scope.selectMenu = ng.bind(scope, selectMenu);
                scope.isSelected = ng.bind(scope, isSelected);
                scope.setSideMenu = ng.bind(scope, setSideMenu, elem);
                scope.logout = ng.bind(scope, logout);
                scope.changePwd = ng.bind(scope, changePwd);
                scope.addCommonMenu = ng.bind(scope, addCommonMenu, $http, $location, $modal, flash);
            }
        };
    };
    var initNav = function(scope, $http, $route, SYS, navigation, currentPath) {
        $http.jsonp(SYS.host + "/api/systems?callback=JSON_CALLBACK").then(function(res) {
            var systemMatched = false;
            ng.forEach(res.data, function(nav) {
                if (nav.code == navigation.code) {
                    systemMatched = true;
                    nav.children = ng.copy(navigation.children);
                    nav.show = navigation.hasOwnProperty("show") ? navigation.show : true;
                } else {
                    nav.children = null;
                }
                if (nav.code == "account") {
                    scope.accountHost = nav.url;
                    scope.userInfo.changePwd = function() {
                        location.href = scope.accountHost + "/#/password";
                    };
                }
            });
            if (systemMatched == false) {
                res.data.push(ng.copy(navigation));
            }
            scope.navigation = res.data;
            init(scope, scope.navigation, $route);
            scope.isInited = true;
            selectPath(scope, currentPath);
            fetchCommonMenus($http, scope);
        }, function(res) {
            scope.navigation = [ navigation ];
            init(scope, scope.navigation, $route);
            scope.isInited = true;
            selectPath(scope, currentPath);
            fetchCommonMenus($http, scope);
        });
    };
    var hasSameMenu = function($scope, url) {
        var hasSameMenu = false;
        ng.forEach($scope.commonMenus, function(menu) {
            if ($.trim(menu.link) == $.trim(url)) {
                hasSameMenu = true;
            }
        });
        return hasSameMenu;
    };
    var addCommonMenu = function($http, $location, $modal, flash) {
        if (this.commonMenus.length >= 10) {
            flash.notify({
                state: "error",
                info: '您设置的常用菜单已经达到10个，请点击 <a href="' + this.accountHost + '/#/menus">这里</a> 清除不经常使用的菜单。'
            });
            return;
        }
        if (hasSameMenu(this, $location.absUrl())) {
            flash.notify({
                state: "error",
                info: "常用菜单中已存在此链接"
            });
            return;
        }
        var dialog = $modal.open({
            controller: "CommonMenuDialogCtrl",
            templateUrl: "templates/common-menu-dialog.html",
            resolve: {
                name: function() {
                    var titleEl = ng.element("body").find(".page-header>h1");
                    if (titleEl.length > 0) {
                        return titleEl.text();
                    }
                    return "";
                },
                url: function() {
                    return $location.absUrl();
                }
            }
        });
        dialog.result.then(function(data) {
            if (this.accountHost === null) {
                return;
            }
            if ($.trim(data.name) == "") {
                flash.notify({
                    state: "error",
                    info: "常用菜单名称不能为空"
                });
                return;
            }
            data.access_token = this.userInfo.accessToken;
            $http.jsonp(this.accountHost + "/api/menus/create?callback=JSON_CALLBACK", {
                params: data
            }).then(function(res) {
                flash.notify({
                    state: "success",
                    info: "常用菜单 " + data.name + " 添加成功"
                });
                this.commonMenus = res.data;
            }.bind(this), function(res) {
                flash.notify({
                    state: "error",
                    info: "常用菜单添加失败，请联系管理员"
                });
            });
        }.bind(this));
    };
    var fetchCommonMenus = function($http, scope) {
        if (scope.accountHost === null || scope.userInfo.accessToken === null) {
            return;
        }
        $http.jsonp(scope.accountHost + "/api/menus/jsonp?callback=JSON_CALLBACK", {
            params: {
                access_token: scope.userInfo.accessToken
            }
        }).then(function(res) {
            scope.commonMenus = res.data;
        });
    };
    var logout = function(evt) {
        evt.preventDefault();
        this.userInfo.logout();
    };
    var changePwd = function(evt) {
        evt.preventDefault();
        this.userInfo.changePwd();
    };
    var parseParams = function(url, params, route) {
        var searchInfo = {};
        var parsedUrl = "";
        var queryInfo = [];
        ng.forEach(params, function(value, key) {
            var paramKey = value.replace("@", "");
            if (route.hasOwnProperty(paramKey)) {
                searchInfo[key] = route[paramKey];
            }
        });
        if (ng.isString(url)) {
            var result = [];
            ng.forEach(url.split(":"), function(segment, i) {
                if (i === 0) {
                    result.push(segment);
                } else {
                    var segmentMatch = segment.match(/(\w+)(.*)/);
                    var key = segmentMatch[1];
                    if (searchInfo.hasOwnProperty(key)) {
                        result.push(segment.replace(key, searchInfo[key]));
                        delete searchInfo[key];
                    }
                }
            });
            parsedUrl = result.join("");
        }
        ng.forEach(searchInfo, function(value, key) {
            queryInfo.push(key + "=" + decodeURIComponent(value));
        });
        if (queryInfo.length > 0) {
            parsedUrl += "?" + queryInfo.join("&");
        }
        return parsedUrl;
    };
    var init = function(scope, parentNavs, $route) {
        var navigation = arguments[3] === undefined ? null : arguments[3];
        var level = arguments[4] === undefined ? 0 : arguments[4];
        ng.forEach(parentNavs, function(nav) {
            nav.urlTemplate = nav.url;
            nav.url = parseParams(nav.url, nav.params, $route.current.params);
            nav.parentNav = navigation;
            nav.level = level + 1;
            nav.show = nav.hasOwnProperty("show") ? nav.show : true;
            if (nav.level == 2 && nav.show == true) {
                scope.hasSubNav = true;
            }
            if (nav.children != null) {
                init(scope, nav.children, $route, nav, nav.level);
            }
        });
    };
    var getEndChildren = function(navigation) {
        var endChildren = arguments[1] ? arguments[1] : [];
        ng.forEach(navigation, function(nav) {
            if (nav.children == null) {
                endChildren.push(nav);
            } else {
                getEndChildren(nav.children, endChildren);
            }
        });
        return generateMatch(endChildren);
    };
    var generateMatch = function(endChildren) {
        ng.forEach(endChildren, function(child) {
            if (ng.isUndefined(child.match) && child.url != null) {
                child.match = child.url.replace("#", "");
            }
        });
        return endChildren;
    };
    var selectPath = function(scope, path) {
        clearSelected(scope.navigation);
        var endChildren = getEndChildren(scope.navigation);
        for (var i = 0; i < endChildren.length; i++) {
            var regexp = new RegExp("^" + endChildren[i].match + "$", [ "i" ]);
            if (regexp.test(path)) {
                scope.select(endChildren[i]);
            }
            if (endChildren[i].level > 2 && scope.noSideMenu) {
                scope.noSideMenu = false;
            }
        }
    };
    var select = function($timeout, elem, nav) {
        nav.selected = true;
        if (nav.level == 2) {
            this.setSideMenu(nav.children, nav.name);
        } else if (nav.level == 4) {
            $timeout(function() {
                var collapse = elem.find(".side-nav-menu").find(".active>.has-sub-menu").parent("li").find("ul");
                collapse.show();
            });
        }
        if (nav.parentNav != null) {
            this.select(nav.parentNav);
        }
    };
    var isSelected = function(item) {
        return item.selected ? true : false;
    };
    var setSideMenu = function(elem, menu, name) {
        if (menu == null || menu.length == 0) {
            this.hasSideMenu = false;
        } else {
            this.hasSideMenu = true;
            this.sideMenuName = name;
            this.menu = menu;
        }
    };
    var toggleSubMenu = function(e) {
        this.isSubMenuShow = !this.isSubMenuShow;
    };
    var clearSelected = function(item) {
        for (var i = 0; i < item.length; i++) {
            item[i].selected = false;
            if (item[i].children != null) {
                clearSelected(item[i].children);
            }
        }
    };
    var parseNavUrl = function(navigation, $route) {
        ng.forEach(navigation, function(nav) {
            nav.url = parseParams(nav.urlTemplate, nav.params, $route.current.params);
            if (nav.children !== null) {
                parseNavUrl(nav.children, $route);
            }
        });
    };
    var selectNav = function(nav) {
        clearSelected(this.navigation);
        if (nav.url != null) {
            selectPath(this, nav.url.replace("#", ""));
        } else {
            this.select(nav);
        }
        this.setSideMenu(nav.children, nav.name);
    };
    var selectMenu = function(menu, evt) {
        if (menu.children != null) {
            ng.element(evt.target).parent("li").find("ul").toggle();
        } else {
            clearSelected(this.menu);
            if (menu.url != null) {
                selectPath(this, menu.url.replace("#", ""));
            } else {
                this.select(menu);
            }
        }
    };
    var AdminuiFrameProvider = function() {
        this.config = {
            defaultShowSubmenu: false,
            showMessageBox: false
        };
        this.$get = function() {
            return this.config;
        };
        this.setConfig = function(config) {
            this.config = ng.extend(this.config, config);
        };
    };
    var CommonMenuDialogCtrl = function($scope, $modalInstance, url, name) {
        $scope.menu = {
            link: url,
            name: name
        };
        $scope.cancel = ng.bind(this, this.cancel, $modalInstance);
        $scope.add = ng.bind(this, this.add, $scope, $modalInstance);
    };
    CommonMenuDialogCtrl.prototype.add = function($scope, $modalInstance, evt) {
        var eventWithEnter = evt.type == "keypress" && evt.charCode == 13;
        if (eventWithEnter || evt.type == "click") {
            $modalInstance.close($scope.menu);
        }
    };
    CommonMenuDialogCtrl.prototype.cancel = function($modalInstance, evt) {
        evt.preventDefault();
        $modalInstance.dismiss("cancel");
    };
    ng.module("ntd.directives").provider("adminuiFrame", [ AdminuiFrameProvider ]);
    ng.module("ntd.directives").directive("adminuiFrame", [ "adminuiFrame", "$rootScope", "$location", "$timeout", "$modal", "$http", "$route", "SYS", "flash", AdminuiFrame ]);
    ng.module("ntd.directives").controller("CommonMenuDialogCtrl", [ "$scope", "$modalInstance", "url", "name", CommonMenuDialogCtrl ]);
})(angular);

(function(ng) {
    "use strict";
    var loadBackdrop = function($location) {
        return {
            restrict: "A",
            link: function(scope, elem, attr) {
                scope.$on("$routeChangeStart", function() {
                    scope.$watch(function() {
                        return $location.path();
                    }, function(value, oldValue) {
                        if (value !== oldValue) {
                            elem.fadeTo(200, .7);
                        }
                    });
                });
                scope.$on("$routeChangeSuccess", function() {
                    elem.finish();
                    elem.fadeOut("normal");
                });
            }
        };
    };
    ng.module("ntd.directives").directive("adminuiLoadBackdrop", [ "$location", loadBackdrop ]);
})(angular);

(function() {
    "use strict";
    var fieldsets, showFilterBtn, primaryFieldset, secondaryFieldset, template = '<div class="advance-search-filter">' + "<div ng-transclude></div>" + '<div class="more">' + '<a data-class="J_toggleShowFilterBtn">' + '<i class="glyphicon glyphicon-chevron-down"></i>' + "</a>" + "</div>" + "</div>";
    function initAdvanceFilter(elem, attrs) {
        $(":submit", elem).clone().appendTo(primaryFieldset);
        primaryFieldset.addClass("skeleton");
        secondaryFieldset.hide();
        elem.bind("click", toggleFilterAction);
        if (attrs.advanceFilter === "opened") {
            $('a[data-class="J_toggleShowFilterBtn"]').trigger("click");
        }
    }
    function toggleFilter(filterElem, elem) {
        primaryFieldset.toggleClass("skeleton").fadeIn();
        secondaryFieldset.animate({
            height: [ "toggle", "swing" ],
            opacity: [ "toggle", "swing" ]
        }, 200, "linear");
        primaryFieldset.find(":submit").toggle();
        if ($(".glyphicon", elem).hasClass("glyphicon-chevron-down")) {
            $(".glyphicon.glyphicon-chevron-down", elem).removeClass("glyphicon-chevron-down").addClass("glyphicon-chevron-up");
        } else {
            $(".glyphicon.glyphicon-chevron-up", elem).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
        }
    }
    function toggleFilterAction(e, elem) {
        var et = e.target;
        if (($(et).attr("data-class") || $(et).parent().attr("data-class")) === showFilterBtn) {
            toggleFilter(elem);
        }
    }
    function advanceFilterDirective() {
        return {
            restrict: "A",
            template: template,
            transclude: true,
            link: function(scope, element, attrs) {
                fieldsets = $(element).find("fieldset"), showFilterBtn = "J_toggleShowFilterBtn", 
                primaryFieldset = fieldsets.eq(0), secondaryFieldset = fieldsets.not(fieldsets.eq(0));
                initAdvanceFilter(element, attrs);
            }
        };
    }
    angular.module("ntd.directives").directive("advanceFilter", [ advanceFilterDirective ]);
})();

(function() {
    "use strict";
    function confirmButtonDirective($document, $parse) {
        return {
            restrict: "A",
            scope: "@",
            link: function(scope, element, attrs) {
                var buttonId, html, message, nope, title, yep, pos;
                buttonId = Math.floor(Math.random() * 1e10);
                attrs.buttonId = buttonId;
                message = attrs.message || "";
                yep = attrs.yes || "确定";
                nope = attrs.no || "取消";
                title = attrs.title || "确认删除?";
                pos = attrs.position || "top";
                html = '<div id="button-' + buttonId + '">' + '<p ng-show="test" class="confirmbutton-msg">' + message + "</p>" + '<button type="button" class="confirmbutton-yes' + ' btn btn-primary">' + yep + "</button>\n" + '<button type="button" class="confirmbutton-no btn btn-default">' + nope + "</button>" + "</div>";
                element.popover({
                    content: html,
                    html: true,
                    placement: pos,
                    trigger: "manual",
                    title: title
                });
                return element.bind("click", function(e) {
                    var dontBubble, pop;
                    dontBubble = true;
                    e.stopPropagation();
                    if (element.hasClass("disabled")) {
                        return false;
                    } else {
                        element.addClass("disabled");
                    }
                    $('[id^="button-"]').closest(".popover").hide().prev().removeClass("disabled");
                    element.popover("show");
                    pop = $("#button-" + buttonId);
                    pop.closest(".popover").click(function(e) {
                        if (dontBubble) {
                            e.stopPropagation();
                        }
                    });
                    pop.find(".confirmbutton-yes").click(function(e) {
                        dontBubble = false;
                        var func = $parse(attrs.confirmButton);
                        func(scope);
                        if (scope.$root.$$phase != "$apply" && scope.$root.$$phase != "$digest") {
                            scope.$apply();
                        }
                    });
                    pop.find(".confirmbutton-no").click(function(e) {
                        dontBubble = false;
                        $document.off("click.confirmbutton." + buttonId);
                        element.popover("hide");
                        element.removeClass("disabled");
                    });
                    $document.on("click.confirmbutton." + buttonId, ":not(.popover, .popover *)", function() {
                        $document.off("click.confirmbutton." + buttonId);
                        element.popover("hide");
                        element.removeClass("disabled");
                    });
                });
            }
        };
    }
    angular.module("ntd.directives").directive("confirmButton", [ "$document", "$parse", confirmButtonDirective ]);
})();

(function() {
    "use strict";
    function easyPieChartDirective($timeout) {
        return {
            restrict: "A",
            scope: {
                item: "=easyPieChart"
            },
            replace: true,
            template: '<div class="easy-pie-chart-widget">' + '<div class="easy-pie-chart">' + '<div class="percentage" data-percent="{{item.percent}}">{{item.usage}}</div>' + "<div>{{item.caption}}</div>" + "</div>" + "</div>",
            link: function(scope, element, attrs) {
                var colorRange = [ "#08c", "#e7912a", "#bacf0b", "#4ec9ce", "#ec7337", "#f377ab" ], lineWidth = attrs.easyPieChartLineWidth || 12, size = attrs.easyPieChartSize || 100, barColor = colorRange[scope.$parent.$index % 6] || "#08c", options = {
                    animate: 2e3,
                    scaleColor: false,
                    lineWidth: lineWidth,
                    lineCap: "square",
                    size: size,
                    barColor: barColor,
                    trackColor: "#e5e5e5"
                }, render_easy_pie_chart = function() {
                    $(".percentage ", element).easyPieChart(options);
                };
                attrs.$observe("easyPieChart", render_easy_pie_chart);
                scope.$watch("item", function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        $(".percentage ", element).data("easyPieChart").update(newValue.percent);
                    }
                }, true);
            }
        };
    }
    angular.module("ntd.directives").directive("easyPieChart", [ "$timeout", easyPieChartDirective ]);
})();

(function() {
    "use strict";
    function fooTableDirective() {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                $(element).addClass("footable").footable();
            }
        };
    }
    angular.module("ntd.directives").directive("fooTable", [ fooTableDirective ]);
})();

"use strict";

angular.module("ntd.directives").directive("nanoScrollbar", [ "$timeout", function($timeout) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            var wrapper = '<div class="span2 affix"><div class="nano"><div class="content"></div></div></div>';
            $(element).children().wrap(wrapper);
            function initNanoScrollBar() {
                var config = {
                    height: function() {
                        return $(window).width() < 767 ? 200 : $(window).height() - 80;
                    },
                    showScrollBar: function() {
                        return $(window).width() < 767 ? true : false;
                    }
                };
                $(".nano", element).css({
                    height: config.height()
                }).nanoScroller({
                    preventPageScrolling: true,
                    iOSNativeScrolling: true,
                    alwaysVisible: config.showScrollBar()
                });
            }
            attrs.$observe("nanoScrollbar", initNanoScrollBar);
            $(element).on("click", function() {
                $timeout(initNanoScrollBar, 200);
            });
            $(window).bind("load resize", initNanoScrollBar);
        }
    };
} ]);

(function() {
    "use strict";
    function labelStateDirective() {
        return {
            restrict: "A",
            transclude: true,
            scope: {
                tips: "@labelState"
            },
            template: "<span ng-transclude></span>" + '<i tooltip-popup-delay="300" ' + 'tooltip="{{tips}}" class="glyphicon glyphicon-question-sign"></i>'
        };
    }
    angular.module("ntd.directives").directive("labelState", [ labelStateDirective ]);
})();

(function() {
    "use strict";
    function navBarDirective($location) {
        return {
            restrict: "A",
            link: function postLink(scope, element, attrs, controller) {
                scope.$watch(function() {
                    return $location.path();
                }, function(newValue, oldValue) {
                    $("li[data-match-route]", element).each(function(k, li) {
                        var $li = angular.element(li), pattern = $li.attr("data-match-route"), regexp = new RegExp("^" + pattern + "$", [ "i" ]);
                        if (regexp.test(newValue)) {
                            $li.addClass("active");
                            if ($li.find("ul").length) {
                                $li.addClass("opened").find("ul").show();
                            }
                        } else {
                            $li.removeClass("active");
                        }
                    });
                });
            }
        };
    }
    angular.module("ntd.directives").directive("navBar", [ "$location", navBarDirective ]);
})();

(function() {
    "use strict";
    function toggle_menuClass() {
        $("#J_subMenu").parent().toggle();
        $("#J_mainContent").toggleClass("col-md-12");
    }
    function toggleSubmenuDirectice() {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                element.bind("click", function() {
                    $(this).bind("selectstart", function() {
                        return false;
                    });
                    $(this).parent().toggleClass("active");
                    toggle_menuClass();
                });
            }
        };
    }
    angular.module("ntd.directives").directive("toggleSubmenu", [ toggleSubmenuDirectice ]);
})();

(function() {
    "use strict";
    function subTreemenuDirective() {
        return {
            restrict: "A",
            link: function(scope, element, attrs, cookieStore) {
                element.on("click", function(event) {
                    var et = event.target;
                    if (et.nodeName.toLowerCase() === "a" && $(et).next("ul").length) {
                        $(et).next("ul").slideToggle("fast");
                        $(et).parent().toggleClass("opened");
                        $(et).bind("selectstart", function() {
                            return false;
                        });
                    } else {
                        var url = $(et).attr("href");
                        $("#bs3").attr("href", "http://ec3s.github.io/adminui-3.0/" + url);
                    }
                });
            }
        };
    }
    angular.module("ntd.directives").directive("subTreemenu", [ subTreemenuDirective ]);
})();

(function() {
    "use strict";
    function ntdPieDirective() {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var id = "#" + attrs.id;
                var data = scope[attrs.data].analysis;
                var width = attrs.pieWidth || 800, height = attrs.pieHeight || 300, radius = Math.min(width, height) / 2;
                var color = d3.scale.ordinal().range([ "#fdc79b", "#ee6962", "#5d96b1", "#b8d97e", "#24CBE5", "#64E572", "#FF9655", "#FFF263" ]);
                var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);
                var pie = d3.layout.pie().sort(null).value(function(d) {
                    return d.value;
                });
                var svg = d3.select(id).append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                var g = svg.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc");
                g.append("path").attr("d", arc).style("fill", function(d) {
                    return color(d.data.name);
                });
                g.append("text").attr("transform", function(d) {
                    return "translate(" + arc.centroid(d) + ")";
                }).attr("dy", ".35em").style("text-anchor", "middle").text(function(d) {
                    return d.data.name;
                });
                var legend = svg.selectAll(".legend").data(color.domain().slice().reverse()).enter().append("g").attr("class", "legend").attr("transform", function(d, i) {
                    return "translate(0," + i * 20 + ")";
                });
                legend.append("rect").attr("x", width - 430).attr("width", 18).attr("height", 18).style("fill", color);
                legend.append("text").attr("x", width - 440).attr("y", 9).attr("dy", ".35em").style("text-anchor", "end").text(function(d) {
                    return d;
                });
            }
        };
    }
    angular.module("ntd.directives").directive("ntdPie", [ ntdPieDirective ]);
})();

(function() {
    "use strict";
    function loadingButtonDirective() {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                scope.$watch(function() {
                    return scope.$eval(attrs.loadingButton);
                }, function(value) {
                    if (value) {
                        if (!attrs.hasOwnProperty("ngDisabled")) {
                            element.addClass("disabled").attr("disabled", "disabled");
                        }
                        element.data("resetText", element.html());
                        element.html(element.data("loading-text"));
                    } else {
                        if (!attrs.hasOwnProperty("ngDisabled")) {
                            element.removeClass("disabled").removeAttr("disabled");
                        }
                        element.html(element.data("resetText"));
                    }
                });
            }
        };
    }
    angular.module("ntd.directives").directive("loadingButton", [ loadingButtonDirective ]);
})();

(function() {
    "use strict";
    var element;
    function getCurrentWindowH() {
        return $(window).width() < 767 ? 200 : $(window).height() - 80;
    }
    function initSlimScroll() {
        $(".slimScroll", element).parent(".slimScrollDiv").css({
            height: getCurrentWindowH() + "px"
        });
        $(".slimScroll", element).css({
            height: getCurrentWindowH() + "px"
        }).slimscroll({
            distance: "2px"
        });
    }
    function slimScrollDirective($timeout) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                if (attrs.slimScrollMenu == "yes") {
                    var wrapper = '<div class="col-md-2 affix">' + '<div class="slimScroll"></div>' + "</div>";
                    $(element).children().wrap(wrapper);
                    attrs.$observe("slimScroll", initSlimScroll);
                    $(element).on("click", function() {
                        $timeout(initSlimScroll, 200);
                    });
                    $(window).bind("load resize", initSlimScroll);
                } else {
                    $(element).slimscroll({
                        width: attrs.slimScrollWidth || "auto",
                        height: attrs.slimScrollHeight || "250px",
                        size: attrs.slimScrollSize || "7px",
                        color: attrs.slimScrollColor || "#000",
                        position: attrs.slimScrollPosition || "right",
                        distance: attrs.slimScrollDistance || "1px",
                        start: "top",
                        opacity: .4,
                        alwaysVisible: false,
                        disableFadeOut: false,
                        railVisible: false,
                        railColor: attrs.slimScrollRailColor || "#333",
                        railOpacity: .2,
                        railDraggable: true,
                        railClass: "slimScrollRail",
                        barClass: "slimScrollBar",
                        wrapperClass: "slimScrollDiv",
                        allowPageScroll: false,
                        wheelStep: 20,
                        touchScrollStep: 200
                    });
                }
            }
        };
    }
    angular.module("ntd.directives").directive("slimScroll", [ "$timeout", slimScrollDirective ]);
})();

(function() {
    "use strict";
    var $element, $tree, $scope;
    function createList(parent) {
        var parentItem = getItem(parent);
        var currItem = getItem($scope.ngModel);
        var level = parentItem ? parentItem.level + 1 : 0;
        var list = $("<ul></ul>").css("margin-left", level * 30 + "%").attr("cl-id", parent);
        angular.forEach($tree, function(item) {
            if (item.parent == parent) {
                var li = $('<li cl-value="' + item.value + '">' + item.text + "</li>").click(onItemClick);
                if (item.children().length > 0) {
                    li.addClass("has-child");
                }
                if (item.value == $scope.ngModel) {
                    list.addClass("selective");
                }
                if (currItem && currItem.path.indexOf("" + item.value) > -1) {
                    li.addClass("selective");
                }
                list.append(li);
            }
        });
        return list;
    }
    function onItemClick(e) {
        var item = $(e.target).addClass("selective");
        var parent = item.parent().addClass("selective");
        var parentId = item.attr("cl-value");
        parent.nextAll("ul").remove();
        item.prevAll(".selective").removeClass("selective");
        item.nextAll(".selective").removeClass("selective");
        parent.prevAll(".selective").removeClass("selective");
        if (item.hasClass("has-child")) {
            var list = createList(parentId);
            $element.append(list);
            var pos = $element.offset().left + $element.width() * 2 / 3;
            if (e.clientX > pos) {
                $element.scrollLeft(parent.prev().offset().left);
            }
        }
        setValue(parentId);
    }
    function getItem(id) {
        var ret = $tree.filter(function(em, idx, arr) {
            return em.value == id;
        });
        return ret[0];
    }
    function setValue(val) {
        $scope.ngModel = val;
        $scope.$apply();
    }
    function initList(val) {
        $element.html("");
        if ($tree == undefined || $tree.length == 0) {
            return;
        }
        var parent = $scope.ngModel;
        var item = getItem(parent);
        parent = item ? item.children().length > 0 ? item.value : item.parent : 0;
        do {
            $element.prepend(createList(parent));
            var item = getItem(parent);
            parent = item ? item.parent : 0;
        } while (item);
        var ul = $element.find("ul.selective");
        if (ul.length > 0) {
            var left = $element.parent().offset().left + $element.parent().width() * 2 / 3;
            if (ul.offset().left > left) {
                $element.scrollLeft(ul.prev().offset().left);
            }
        }
    }
    var TreeData = function(data, options) {
        var ret = [];
        angular.forEach(data, function(item) {
            var path = item[options.path].split("/").slice(1, -1);
            ret.push({
                value: item[options.value],
                text: item[options.text],
                parent: item[options.parent],
                path: path,
                level: path.length - 1,
                children: function() {
                    var val = this.value;
                    var son = data.filter(function(em, idx, arr) {
                        return em[options.parent] == val;
                    });
                    return son;
                }
            });
        });
        return ret;
    };
    function cascadeListDirective($parse) {
        return {
            restrict: "ACE",
            replace: false,
            scope: {
                ngModel: "=",
                data: "="
            },
            link: function(scope, element, attrs) {
                $scope = scope;
                $element = $('<div class="cascade-list-inner"></div>').css("width", attrs.width || "100%").css("height", attrs.height || "220px");
                element.append($element).addClass("cascade-list");
                var options = {
                    name: attrs.name,
                    parent: attrs.parent || "parent",
                    value: attrs.value || "id",
                    text: attrs.text || "name",
                    path: attrs.path || "path"
                };
                scope.$watch("data", function(val, old) {
                    $tree = new TreeData(val, options);
                    initList($tree);
                });
                scope.$watch("ngModel", function(val, old) {
                    if (val != old) {
                        initList();
                    }
                });
            }
        };
    }
    angular.module("ntd.directives").directive("cascadeList", [ "$parse", cascadeListDirective ]);
})();

(function(app, ng) {
    "use strict";
    var Chosen = function($parse, $timeout) {
        return {
            restrict: "AC",
            link: function(scope, elem, attrs) {
                var ngOptions = attrs.ngOptions || null;
                var ngModelName = attrs.ngModel || null;
                var onSearch = attrs.onSearchPromise || null;
                var optionsNode = attrs.optionsNode || null;
                var multiple = attrs.multiple || null;
                var oldSearch = "";
                var initOptions;
                var disableSearchThreshold = attrs.disableSearchThreshold || 0;
                var allowSingleDeselect = attrs.allowSingleDeselect || false;
                allowSingleDeselect = allowSingleDeselect == "true";
                var options = {
                    disable_search_threshold: disableSearchThreshold
                };
                var chosenEl = elem.chosen(options);
                var chosen = chosenEl.data("chosen");
                chosen.container.hide();
                $timeout(function() {
                    chosenEl.css("display", "inline");
                    chosen.container.css({
                        "max-width": chosenEl.innerWidth(),
                        width: chosenEl.innerWidth()
                    }).show();
                    chosenEl.css("display", "none");
                }, 100);
                var selected_options = {};
                var searchTxt = scope.$new(false);
                if (onSearch) {
                    chosen.winnow_results = function() {
                        this.no_results_clear();
                        var searchText = this.get_search_text();
                        var results_data = this.results_data;
                        var option_number = 0;
                        for (var i = 0; i < results_data.length; i++) {
                            var option = results_data[i];
                            if (!option.empty) {
                                option_number++;
                                option.search_match = true;
                                option.search_text = option.group ? option.label : option.html;
                            }
                        }
                        if (option_number <= 0) {
                            this.update_results_content("");
                            this.result_clear_highlight();
                            return this.no_results(searchText);
                        } else {
                            this.update_results_content(this.results_option_build());
                            return this.winnow_results_set_highlight();
                        }
                    };
                    chosen.show_search_field_default = function() {
                        if (this.is_multiple && this.choices_count() < 1 && !this.active_field) {
                            this.search_field.val(this.default_text);
                            return this.search_field.addClass("default");
                        } else {
                            return this.search_field.removeClass("default");
                        }
                    };
                }
                chosen.allow_single_deselect = allowSingleDeselect;
                if (ngOptions) {
                    var optionsModelName = ngOptions.split(" ").pop();
                    var optionsModelGetter = $parse(optionsModelName);
                    var optionsModelSetter = optionsModelGetter.assign;
                    scope.$watch(optionsModelName, function(newValue, oldValue) {
                        chosenEl.trigger("liszt:data_loaded", {
                            options: newValue,
                            optionsModelName: optionsModelName
                        });
                    }, true);
                }
                if (ngModelName) {
                    scope.$watch(ngModelName, function(newValue, oldValue) {
                        if (multiple) {
                            ng.forEach(newValue, function(value) {
                                if (!selected_options[value]) {
                                    ng.forEach(optionsModelGetter(scope), function(item, index) {
                                        if (item.id == value) {
                                            selected_options[value] = optionsModelGetter(scope)[index];
                                        }
                                    });
                                }
                            });
                        }
                        if (newValue !== oldValue) {
                            elem.trigger("liszt:updated");
                        }
                    }, true);
                }
                chosenEl.bind("liszt:hiding_dropdown", function(e) {
                    if (!chosen.active_field && ng.isArray(initOptions)) {
                        optionsModelSetter(scope, initOptions);
                        searchTxt.$search = "";
                        searchTxt.$apply();
                        $timeout(function() {
                            chosenEl.trigger("liszt:updated");
                            chosen.search_field.val(searchTxt.$search);
                        });
                    } else if (chosen.active_field) {
                        initOptions = optionsModelGetter(scope);
                    }
                });
                chosenEl.bind("liszt:showing_dropdown", function(e, data) {
                    if (onSearch) {
                        if (!searchTxt.$search) {
                            $timeout(function() {
                                chosen.search_results.find(".no-results").text("请输入关键字...");
                            });
                            return;
                        }
                        if (!multiple) {
                            chosen.search_field.val(searchTxt.$search);
                        }
                        chosenEl.trigger("liszt:load_data", {
                            onSearch: onSearch,
                            optionsModelName: optionsModelName,
                            needRecord: true
                        });
                    }
                });
                chosenEl.bind("liszt:load_data", function(e, data) {
                    var promise = searchTxt.$eval(data.onSearch);
                    chosen.search_field.addClass("loading");
                    chosen.search_results.find(".no-results").text("加载中...");
                    promise.then(function(result) {
                        var options = [];
                        if (optionsNode) {
                            options = result[optionsNode];
                        } else {
                            options = result;
                        }
                        if (!ng.isArray(options)) {
                            options = [];
                        }
                        if (data.needRecord && !initOptions) {
                            initOptions = options;
                        }
                        chosenEl.trigger("liszt:data_loaded", {
                            options: options,
                            optionsModelName: data.optionsModelName
                        });
                    });
                });
                chosenEl.bind("liszt:data_loaded", function(e, data) {
                    if (onSearch) {
                        chosen.search_field.removeClass("loading");
                        if (ng.isArray(data.options) && data.options.length > 0) {
                            if (!initOptions) {
                                initOptions = data.options;
                            }
                            optionsModelSetter(scope, data.options);
                        } else {
                            optionsModelSetter(scope, []);
                        }
                        if (multiple) {
                            ng.forEach(selected_options, function(selectedOption) {
                                var hasOption = false;
                                ng.forEach(optionsModelGetter(scope), function(option) {
                                    if (option.id == selectedOption.id) {
                                        hasOption = true;
                                        return;
                                    }
                                });
                                if (!hasOption) {
                                    var options = optionsModelGetter(scope);
                                    options.push(selectedOption);
                                    if (ng.isArray(options)) {
                                        optionsModelSetter(scope, options);
                                    }
                                }
                            });
                        }
                    }
                    $timeout(function() {
                        chosenEl.trigger("liszt:updated");
                        if (!searchTxt.$search) {
                            chosen.search_results.find(".no-results").text("请输入关键字...");
                        }
                    });
                });
                if (onSearch && optionsModelName) {
                    chosen.search_field.bind("keyup", function(e) {
                        if (chosen && chosen.results_showing) {
                            searchTxt.$search = chosen.get_search_text();
                            $timeout(function() {
                                if (oldSearch != searchTxt.$search) {
                                    oldSearch = searchTxt.$search;
                                    chosenEl.trigger("liszt:load_data", {
                                        onSearch: onSearch,
                                        optionsModelName: optionsModelName
                                    });
                                }
                            }, 500);
                        }
                    });
                }
                chosenEl.change(function(e) {
                    elem.trigger("liszt:updated");
                });
            }
        };
    };
    var Linkage = function($parse) {
        return {
            restrict: "AC",
            template: "<span><span" + ' data-ng-repeat="linkage in linkages">' + ' <select class="col-sm-3" data-ntd-chosen' + ' data-placeholder="请选择"' + ' data-disable-search-threshold="10"' + ' data-ng-change="change($index)"' + ' data-ng-model="values[$index]"' + ' data-allow-single-deselect="true"' + ' data-ng-options="option as option.name' + ' for option in linkage">' + ' <option value=""></option>' + "</select></span></span>",
            scope: {
                source: "=",
                ngModel: "="
            },
            link: function(scope, elem, attrs) {
                var baseLevels;
                scope.$watch("source", function(value, oldValue) {
                    if (!ng.isArray(scope.ngModel)) {
                        scope.ngModel = [];
                    }
                    initOptions();
                    changeSelect();
                }, true);
                var initOptions = function() {
                    baseLevels = [];
                    scope.values = [];
                    scope.linkages = [];
                    ng.forEach(scope.source, function(item) {
                        baseLevels.push(item);
                    });
                    scope.linkages.push(baseLevels);
                };
                var changeSelect = function() {
                    if (scope.ngModel.length > 0) {
                        ng.forEach(scope.ngModel, function(id, index) {
                            ng.forEach(scope.linkages[index], function(item) {
                                if (item.id == id) {
                                    scope.values[index] = item;
                                    scope.change(index);
                                }
                            });
                        });
                    } else {
                        scope.values[0] = "";
                        scope.change(0);
                    }
                };
                scope.change = function(index) {
                    var tmpLevels = [];
                    var level = scope.linkages.length - 1;
                    var offset = scope.values[index];
                    var values = [];
                    if (!offset) {
                        scope.linkages.splice(index + 1, level - index);
                        scope.values.splice(index + 1, level - index);
                    } else {
                        if (offset.children) {
                            ng.forEach(offset.children, function(item) {
                                tmpLevels.push(item);
                            });
                        }
                        if (level <= index && tmpLevels.length > 0) {
                            scope.linkages.push(tmpLevels);
                        } else if (index < level) {
                            scope.linkages.splice(index + 1, level - index);
                            scope.values.splice(index + 1, level - index);
                            if (tmpLevels.length > 0) {
                                scope.linkages[index + 1] = tmpLevels;
                            }
                        }
                    }
                    $(scope.values).each(function(index, item) {
                        if (!!item == true && !!item.id == true) {
                            values.push(item.id);
                        }
                    });
                    scope.ngModel = values;
                };
            }
        };
    };
    app.directive("ntdChosen", [ "$parse", "$timeout", Chosen ]);
    app.directive("ntdLinkage", [ "$parse", Linkage ]);
})(angular.module("ntd.directives"), angular);

(function() {
    "use strict";
    function tagInputDirective() {
        return {
            restrict: "AC",
            replace: true,
            scope: {
                tags: "=ngModel",
                placeholder: "@",
                id: "@"
            },
            template: '<div class="tag-input-container">' + "<ul data-ng-class=\"{true: 'focus'}[isFocus]\">" + '<li class="tag" data-ng-repeat="tag in tags">' + "<span>{{tag.name}}</span>" + '<i data-ng-show="tagsAttribute[$index].editable"' + ' class="glyphicon glyphicon-pencil"' + ' data-ng-click="editTag($index, $event)"></i>' + ' <i data-ng-show="tagsAttribute[$index].deletable"' + ' data-ng-click="removeTag($index)"' + ' class="glyphicon glyphicon-remove"></i></li><li class="input-li">' + '<input id="{{id}}" class="form-control input-sm"' + ' data-ng-model="tagInput"' + ' placeholder="{{placeholder}}" type="text" autocomplete="false" />' + "</li>" + "</ul>" + "</div>",
            link: function(scope, elem, attrs) {
                var placeholder = attrs.placeholder;
                var caseSensitive = attrs.caseSensitive || false;
                var allwaysPlaceholder = scope.$eval(attrs.allwaysPlaceholder) || false;
                var unique = scope.$eval(attrs.unique) || true;
                var uniqueTags = [];
                var oldInput;
                var tagsAttribute = scope.tagsAttribute = [];
                var getPopHtml = function(index) {
                    return '<div id="pop_' + index + '" >' + '<p><input id="pop_inp_' + index + '"' + ' type="text" class="form-control input-sm"/></p>' + ' <button type="button"' + ' class="btn btn-primary btn-sm">' + ' 确定</button>\n<button type="button"' + ' class="btn btn-default btn-sm">' + " 取消</button>" + "</div>";
                };
                var cancelEdit = function(index) {
                    return function(e) {
                        angular.element(elem.find("li")[index]).popover("destroy");
                        elem.find("input").focus();
                    };
                };
                var useEdit = function(index) {
                    return function(e) {
                        var tagName = elem.find("#pop_inp_" + index).val();
                        var findIndex = indexOf(scope.tags, {
                            name: tagName
                        });
                        if (!unique || findIndex === -1) {
                            scope.tags[index].name = tagName;
                            scope.$apply();
                        } else {
                            angular.element(elem.find("li")[findIndex]).fadeTo("fast", .2).fadeTo("fast", 1);
                        }
                        angular.element(elem.find("li")[index]).popover("destroy");
                        elem.find("input").focus();
                    };
                };
                var closeAllPop = function() {
                    elem.find("li").each(function(index, item) {
                        angular.element(item).popover("destroy");
                    });
                };
                var isDeletable = function(tag) {
                    return angular.isUndefined(tag.deletable) || tag.deletable;
                };
                var isEditable = function(tag) {
                    return !angular.isUndefined(tag.editable) && tag.editable;
                };
                var setTagAttribute = function(tag, index) {
                    if (!angular.isObject(tagsAttribute[index])) {
                        tagsAttribute[index] = {
                            deletable: isDeletable(tag) ? true : false,
                            editable: isEditable(tag) ? true : false
                        };
                    }
                    delete tag.deletable;
                    delete tag.editable;
                };
                var unifyItemInTags = function(tags) {
                    angular.forEach(tags, function(tag, index) {
                        if (angular.isString(tag)) {
                            tags[index] = {
                                name: tag
                            };
                        }
                        setTagAttribute(tags[index], index);
                    });
                };
                unifyItemInTags(scope.tags);
                var indexOf = function(tags, tag) {
                    if (!caseSensitive) {
                        var tagName = tag.name.toLowerCase();
                        var allNames = tags.map(function(tag) {
                            return tag.name.toLowerCase();
                        });
                    }
                    return allNames.indexOf(tagName);
                };
                if (!angular.isArray(scope.tags)) {
                    scope.tags = [];
                }
                if (unique) {
                    angular.forEach(scope.tags, function(tag) {
                        if (indexOf(uniqueTags, tag) === -1) {
                            uniqueTags.push(tag);
                        }
                    });
                    scope.tags = uniqueTags;
                }
                scope.removeTag = function(index) {
                    closeAllPop();
                    scope.tags.splice(index, 1);
                    tagsAttribute.splice(index, 1);
                };
                scope.editTag = function(index, event) {
                    event.stopPropagation();
                    closeAllPop();
                    angular.element(elem.find("li")[index]).popover({
                        content: getPopHtml(index),
                        html: true,
                        placement: "top",
                        trigger: "manual",
                        title: "修改"
                    });
                    angular.element(elem.find("li")[index]).popover("show");
                    elem.find("#pop_inp_" + index).focus().bind("keypress", function(e) {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            useEdit(index)(e);
                        }
                    }).val(scope.tags[index].name);
                    elem.find("#pop_" + index).find(".btn-primary").bind("click", useEdit(index));
                    elem.find("#pop_" + index).find(".btn-default").bind("click", cancelEdit(index));
                    elem.find(".popover").bind("click", function(e) {
                        e.stopPropagation();
                    });
                };
                var addTag = function(tag) {
                    scope.tags.push(tag);
                    tagsAttribute.push({
                        deletable: true,
                        editable: false
                    });
                };
                elem.find("input").bind("focus", function() {
                    scope.isFocus = true;
                    scope.$apply();
                });
                elem.find("input").bind("blur", function() {
                    scope.isFocus = false;
                    var oldValue = $(this).val();
                    if (oldValue) {
                        var tag = {
                            name: oldValue
                        };
                        var index = indexOf(scope.tags, tag);
                        if (!unique || index === -1) {
                            addTag(tag);
                        } else {
                            angular.element(elem.find("li")[index]).fadeTo("fast", .2).fadeTo("fast", 1);
                        }
                    }
                    scope.tagInput = "";
                    if (scope.$root.$$phase != "$apply" && scope.$root.$$phase != "$digest") {
                        scope.$apply();
                    }
                });
                elem.bind("click", function(e) {
                    closeAllPop();
                    elem.find("input").focus();
                });
                elem.find("input").bind("keyup", function(e) {
                    if (oldInput != scope.tagInput) {
                        oldInput = scope.tagInput;
                    } else if (e.keyCode == 8 && scope.tags.length > 0) {
                        if (oldInput == scope.tagInput) {
                            var tagAttribute = tagsAttribute[scope.tags.length - 1];
                            if (tagAttribute.deletable === true) {
                                scope.removeTag(scope.tags.length - 1);
                                scope.$apply();
                            } else {
                                angular.element(elem.find("li")[scope.tags.length - 1]).stop().fadeTo("fast", .2).fadeTo("fast", 1);
                            }
                        }
                    }
                });
                scope.$watch("tags", function(newValue, oldValue) {
                    unifyItemInTags(newValue);
                    if (!allwaysPlaceholder) {
                        if (angular.isArray(newValue) && newValue.length > 0) {
                            elem.find("input").attr("placeholder", "");
                        } else {
                            elem.find("input").attr("placeholder", placeholder);
                        }
                    }
                }, true);
                scope.$watch("tagInput", function(newValue, oldValue) {
                    if (newValue != oldValue) {
                        var lastChar = newValue.substr(-1, 1);
                        if (lastChar == ";" || lastChar == "；") {
                            if (oldValue) {
                                var tag = {
                                    name: oldValue
                                };
                                var index = indexOf(scope.tags, tag);
                                if (!unique || index === -1) {
                                    addTag(tag);
                                } else {
                                    angular.element(elem.find("li")[index]).fadeTo("fast", .2).fadeTo("fast", 1);
                                }
                            }
                            scope.tagInput = "";
                        }
                    }
                });
            }
        };
    }
    angular.module("ntd.directives").directive("tagInput", [ tagInputDirective ]);
})();

(function() {
    "use strict";
    function fieldErrorDirective() {
        return {
            template: '<span class="text-danger" ng-show="showError" ng-transclude></span>',
            restrict: "EAC",
            transclude: true,
            scope: {
                "for": "="
            },
            link: function(scope) {
                scope.$watch("{v: for.$invalid, d: for.$dirty}| json", function(v, ov) {
                    v = JSON.parse(v);
                    scope.showError = v.v && v.d;
                });
            }
        };
    }
    angular.module("ntd.directives").directive("fieldError", [ fieldErrorDirective ]);
})();

(function() {
    "use strict";
    var msgObj = {
        info: "alert-info",
        error: "alert-danger",
        success: "alert-success",
        warning: "alert-warning"
    };
    function buildHtml(message) {
        var noticeHtml = '<div class="alert ' + msgObj[message.state] + '">' + "<strong>" + message.info + "</strong>" + '<button type="button" class="close">×</button>' + "</div>";
        return noticeHtml;
    }
    function noticeDirective($rootScope, $location, $timeout) {
        return {
            restrict: "EAC",
            replace: false,
            transclude: false,
            link: function(scope, element, attr) {
                $rootScope.$on("event:notification", function(event, message) {
                    element.html(buildHtml(message));
                    element.show().find("button").on("click", function() {
                        element.fadeOut();
                    });
                    if (message.redirect_url) {
                        $timeout(function() {
                            $location.path(message.redirect_url);
                        }, 1500);
                    }
                });
                scope.$watch(function() {
                    return $location.url();
                }, function() {
                    element.fadeOut();
                });
            }
        };
    }
    angular.module("ntd.directives").directive("notice", [ "$rootScope", "$location", "$timeout", noticeDirective ]);
})();

(function() {
    "use strict";
    function build_msg(type, message) {
        type = type == "error" ? "danger" : type;
        var html = '<div class="alert alert-' + type + '">' + message + '<button type="button" class="close">×</button>' + "</div>";
        return html;
    }
    function flashAlertDirective($rootScope, $timeout) {
        return {
            scope: true,
            restrict: "EAC",
            link: function($scope, element, attr) {
                var html_fragement = "";
                $rootScope.$on("event:flashMessageEvent", function(event, msg) {
                    if (angular.isArray(msg)) {
                        angular.forEach(msg, function(item, key) {
                            html_fragement += build_msg(item.state, item.info);
                        });
                    } else {
                        html_fragement += build_msg(msg.state, msg.info);
                    }
                });
                $rootScope.$on("$routeChangeSuccess", function() {
                    element.empty();
                    if (html_fragement) {
                        element.append(html_fragement);
                        $(".close", element).bind("click", function() {
                            $(this).parent(".alert").fadeOut(function() {
                                $(this).remove();
                            });
                        });
                        html_fragement = "";
                    }
                });
            }
        };
    }
    angular.module("ntd.directives").directive("flashAlert", [ "$rootScope", "$timeout", flashAlertDirective ]);
})();

(function(ng) {
    var CheckboxGroup = function() {
        return {
            restrict: "A",
            templateUrl: "templates/checkbox-group.html",
            scope: {
                dataSource: "=ngModel"
            },
            link: function(scope, elem, attrs) {
                scope.status = "none";
                scope.init = ng.bind(scope, init, elem);
                scope.watchCheckboxGroup = ng.bind(scope, watchCheckboxGroup);
                scope.toggleCheckedAll = ng.bind(scope, toggleCheckedAll);
                scope.init(elem);
                scope.watchCheckboxGroup();
            }
        };
    };
    var watchCheckboxGroup = function() {
        this.$watch("dataSource.checkboxGroup", function(value, oldValue) {
            var status = [];
            ng.forEach(value, function(checkbox) {
                if (true == Boolean(checkbox.checked)) {
                    status.push(checkbox);
                }
            });
            if (status.length > 0 && status.length < this.dataSource.checkboxGroup.length) {
                this.status = "part";
            } else if (status.length == this.dataSource.checkboxGroup.length && status.length > 0) {
                this.status = "all";
            } else {
                this.status = "none";
            }
        }.bind(this), true);
    };
    var toggleCheckedAll = function() {
        this.status = this.status == "none" ? "all" : "none";
        ng.forEach(this.dataSource.checkboxGroup, function(checkbox) {
            checkbox.checked = this.status == "all" ? true : false;
        }, this);
    };
    var init = function(elem) {
        var titleCheckBox = elem.find(".dropdown-toggle>input");
        var dropMenu = elem.find(".dropdown-menu");
        titleCheckBox.bind("click", function(e) {
            e.stopPropagation();
        });
        dropMenu.bind("click", function(e) {
            e.stopPropagation();
        });
    };
    ng.module("ntd.directives").directive("checkboxGroup", [ CheckboxGroup ]);
})(angular);

(function(ng) {
    "use strict";
    var pagination = {
        config: {
            directionLinks: true,
            previousText: "«",
            nextText: "»",
            total: 1,
            size: 5,
            page: 1,
            pageKey: "page",
            rotate: false
        },
        updateConfig: function(pageInfo) {
            pageInfo = ng.extend(this.config, pageInfo);
        },
        noPrevious: function() {
            return this.config.page === 1;
        },
        noNext: function() {
            return this.config.page === this.config.total;
        },
        isActive: function(page) {
            return parseInt(this.config.page) === parseInt(page);
        },
        makePage: function(number, text, isActive, isDisabled) {
            return {
                number: number,
                text: text,
                active: isActive,
                disabled: isDisabled
            };
        },
        getPages: function() {
            var pages = [];
            if (this.config.total <= 1) {
                return;
            }
            var startPage = 1, endPage = this.config.total;
            var isMaxSized = this.config.size && this.config.size < this.config.total;
            if (isMaxSized) {
                startPage = Math.max(this.config.page - Math.floor(this.config.size / 2), 1);
                endPage = startPage + this.config.size - 1;
                if (endPage > this.config.total) {
                    endPage = this.config.total;
                    startPage = endPage - this.config.size + 1;
                }
            }
            for (var number = startPage; number <= endPage; number++) {
                if (number == 1 || number == this.config.total) {
                    continue;
                }
                var page = this.makePage(number, number, this.isActive(number), false);
                pages.push(page);
            }
            if (isMaxSized && !this.config.rotate) {
                if (startPage > 1) {
                    var previousPageSet = this.makePage(startPage - 1, "...", false, false);
                    pages.unshift(previousPageSet);
                }
                if (endPage < this.config.total) {
                    var nextPageSet = this.makePage(endPage + 1, "...", false, false);
                    pages.push(nextPageSet);
                }
            }
            var firstPage = this.makePage(1, 1, this.isActive(1), false);
            pages.unshift(firstPage);
            var lastPage = this.makePage(this.config.total, this.config.total, this.isActive(this.config.total), false);
            pages.push(lastPage);
            if (pagination.config.directionLinks) {
                var previousPage = this.makePage(this.config.page - 1, this.config.previousText, false, this.noPrevious());
                pages.unshift(previousPage);
                var nextPage = this.makePage(this.config.page + 1, this.config.nextText, false, this.noNext());
                pages.push(nextPage);
            }
            return pages;
        },
        selectPage: function($location, page) {
            if (!this.isActive(page) && page > 0 && page <= this.config.total) {
                this.config.page = page;
                var searchOpt = $location.search();
                searchOpt[this.config.pageKey] = page;
                $location.search(searchOpt).replace();
            }
        },
        render: function($scope) {
            $scope.pages = this.getPages();
        }
    };
    var AdminPageDirective = function($location) {
        return {
            restrict: "A",
            template: '<ul class="pagination">\n' + '<li ng-repeat="page in pages"' + ' ng-class="{active: page.active, disabled: page.disabled}">' + '<a ng-click="selectPage(page.number)">{{page.text}}</a></li>\n' + "</ul>\n",
            replace: true,
            scope: {
                pageInfo: "=ngModel"
            },
            link: function(scope, element, attrs) {
                pagination.updateConfig(scope.pageInfo);
                scope.$watch("pageInfo", function(value) {
                    pagination.updateConfig(value);
                    pagination.render(scope);
                }, true);
                scope.selectPage = ng.bind(pagination, pagination.selectPage, $location);
            }
        };
    };
    ng.module("ntd.directives").directive("adminuiPagination", [ "$location", AdminPageDirective ]);
})(angular);

(function(ng) {
    "use strict";
    var FinderDirective = function($timeout) {
        return {
            restrict: "A",
            templateUrl: "templates/finder.html",
            scope: {
                source: "=",
                ngModel: "="
            },
            link: function(scope, elem, attrs) {
                var finder = new Finder(scope, $timeout, elem);
                scope.$watch("ngModel", function(value, oldValue) {
                    if (finder.isClick == false && value != oldValue) {
                        finder.selectItemByValue(scope, value);
                    } else {
                        finder.isClick = false;
                    }
                });
                scope.$watch("source", function(value, oldValue) {
                    if (value != oldValue) {
                        finder = new Finder(scope, $timeout, elem);
                    }
                }, true);
            }
        };
    };
    var Finder = function(scope, $timeout, elem) {
        this.dataSource = this.initData(scope.source);
        this.elem = elem;
        this.$timeout = $timeout;
        this.isClick = false;
        this.expandList = [];
        this.selectedItems = [];
        this.initialize(scope);
    };
    Finder.prototype.initialize = function(scope) {
        scope.finderList = this.getExpandList(null);
        this.selectItemByValue(scope, scope.ngModel);
        scope.showChildren = ng.bind(this, this.showChildren, scope);
        scope.hasChildren = ng.bind(this, this.hasChildren);
        scope.isItemSelected = ng.bind(this, this.isItemSelected);
        scope.isLevelSelected = ng.bind(this, this.isLevelSelected);
    };
    Finder.prototype.selectItemByValue = function(scope, value) {
        var item = this.getItemByValue(scope.source, value);
        if (item != null) {
            var selectedItems = this.getAllSelected(item);
            ng.forEach(selectedItems, function(item) {
                this.showChildren(scope, item);
            }, this);
        } else {
            if (this.expandList.length > 1) {
                this.expandList.splice(1, this.expandList.length - 1);
            }
            this.selectedItems = [];
        }
    };
    Finder.prototype.getItemByValue = function(source, value) {
        var result = null;
        ng.forEach(source, function(item) {
            if (item.value == value) {
                result = item;
            }
        });
        return result;
    };
    Finder.prototype.getExpandList = function(selectedItem) {
        this.selectedItems = this.getAllSelected(selectedItem);
        if (this.selectedItems.length <= 0) {
            this.expandList.push(this.dataSource[0]["/"]);
        }
        return this.expandList;
    };
    Finder.prototype.isItemSelected = function(item, index) {
        if (this.selectedItems[index] == item) {
            return true;
        }
        return false;
    };
    Finder.prototype.isLevelSelected = function(level) {
        if (this.selectedItems.length - 1 == level) {
            return true;
        }
        return false;
    };
    Finder.prototype.showChildren = function(scope, item, evt) {
        var level = this.getLevel(item);
        var childLevel = level + 1;
        var children = this.getChildren(item);
        if (!ng.isUndefined(this.selectedItems[level])) {
            this.selectedItems.splice(level, this.selectedItems.length - level);
        }
        this.selectedItems[level] = item;
        scope.ngModel = this.selectedItems.slice(-1).pop().value;
        if (ng.isUndefined(evt)) {
            this.scrollToView(this.selectedItems.length - 1);
        } else {
            this.isClick = true;
        }
        if (this.expandList.length >= childLevel) {
            this.expandList.splice(childLevel, this.expandList.length - childLevel);
        }
        if (children != null) {
            this.expandList[childLevel] = this.getChildren(item);
        }
    };
    Finder.prototype.scrollToView = function(listIndex) {
        this.$timeout(function() {
            var ul = ng.element(this.elem.find("ul")[listIndex]);
            var li = ul.find("li.selected");
            var index = ul.find("li").index(li);
            ul.scrollTop(index * li.innerHeight() - ul.innerHeight() / 2);
        }.bind(this));
    };
    Finder.prototype.getChildren = function(item) {
        var childLevel = this.getLevel(item) + 1;
        var children = null;
        if (!ng.isUndefined(this.dataSource[childLevel])) {
            if (this.dataSource[childLevel].hasOwnProperty(this.getPath(item))) {
                children = this.dataSource[childLevel][this.getPath(item)];
            }
        }
        return children;
    };
    Finder.prototype.hasChildren = function(item) {
        return this.getChildren(item) == null ? false : true;
    };
    Finder.prototype.initData = function(dataSource) {
        var groupedData = [];
        ng.forEach(dataSource, function(item) {
            var level = this.getLevel(item);
            var parentPath = this.getParentPath(item);
            if (ng.isUndefined(groupedData[level])) {
                groupedData[level] = {};
            }
            if (ng.isUndefined(groupedData[level][parentPath])) {
                groupedData[level][parentPath] = [];
            }
            groupedData[level][parentPath].push(item);
        }, this);
        return groupedData;
    };
    Finder.prototype.getLevel = function(item) {
        var path = this.getPath(item, false);
        return path.split("/").length - 1;
    };
    Finder.prototype.getPath = function(item, startWithSlash) {
        var startWithSlash = ng.isUndefined(startWithSlash) ? true : startWithSlash;
        var path = item.path;
        if (path[path.length - 1] == "/") {
            path = path.substr(0, path.length - 1);
        }
        if (startWithSlash == false) {
            path = path.substr(1, path.length - 1);
        }
        return path;
    };
    Finder.prototype.getParent = function(item) {
        var parentPath = this.getParentPath(item);
        var parentItem = null;
        var level = this.getLevel(item);
        if (level > 0) {
            ng.forEach(this.dataSource[level - 1], function(items, path) {
                if (parentPath.indexOf(path) == 0) {
                    ng.forEach(items, function(item) {
                        if (this.getPath(item) == parentPath) {
                            parentItem = item;
                        }
                    }, this);
                }
            }, this);
        }
        return parentItem;
    };
    Finder.prototype.getAllSelected = function(item) {
        var parents = ng.isUndefined(arguments[1]) ? [] : arguments[1];
        if (item == null) {
            return parents;
        } else {
            parents.unshift(item);
            return this.getAllSelected(this.getParent(item), parents);
        }
    };
    Finder.prototype.getParentPath = function(item, startWithSlash) {
        var startWithSlash = ng.isUndefined(startWithSlash) ? true : startWithSlash;
        var path = "";
        if (startWithSlash == true) {
            path = "/";
        }
        if (item === null) {
            return path;
        } else {
            var pathInfo = this.getPath(item, false).split("/");
            return path + pathInfo.slice(0, pathInfo.length - 1).join("/");
        }
    };
    ng.module("ntd.directives").directive("adminuiFinder", [ "$timeout", FinderDirective ]);
})(angular);

(function(ng) {
    "use strict";
    var Switcher = function(elem, status, disabled) {
        this.elem = elem;
        this.onAnimate = false;
        this.initialize();
        this.setStatus(status, true);
        this.disabled(disabled);
    };
    Switcher.prototype.setStatus = function(status, setOffset) {
        if (status === true) {
            this.elem.addClass("on");
            this.elem.removeClass("off");
        } else {
            this.elem.addClass("off");
            this.elem.removeClass("on");
            if (setOffset) {
                this.innerElem.css("left", -this.onElem.outerWidth());
            }
        }
    };
    Switcher.prototype.disabled = function(disabled) {
        if (disabled) {
            this.elem.addClass("disabled");
        } else {
            this.elem.removeClass("disabled");
        }
    };
    Switcher.prototype.initialize = function() {
        var elem = this.elem;
        var innerElem = this.innerElem = elem.find(".adminui-switcher-inner");
        var onElem = this.onElem = elem.find(".on-label");
        var offElem = this.offElem = elem.find(".off-label");
        var onElemWidth = onElem.outerWidth();
        var offElemWidth = offElem.outerWidth();
        var dividerElemWidth = elem.find(".divider").outerWidth();
        var elemWidth = Math.max(onElemWidth, offElemWidth);
        elem.width(elemWidth + dividerElemWidth + 2);
        onElem.css("width", elemWidth);
        offElem.css("width", elemWidth);
        innerElem.width(elemWidth * 2 + dividerElemWidth);
    };
    Switcher.prototype.switch = function(value, callback) {
        var newValue = !value;
        var elem = this.elem;
        var offset;
        if (newValue == true) {
            offset = 0;
        } else {
            offset = -this.onElem.outerWidth();
        }
        this.onAnimate = true;
        this.setStatus(newValue);
        this.innerElem.animate({
            left: offset
        }, 200, function() {
            this.onAnimate = false;
            if (callback) {
                callback.call(this, newValue);
            }
        }.bind(this));
    };
    var SwitcherDirective = function($timeout) {
        return {
            restrict: "A",
            replace: true,
            scope: {
                model: "=ngModel",
                disabled: "=disabled",
                ngChange: "&",
                ngClick: "&",
                onLabel: "@",
                offLabel: "@"
            },
            templateUrl: "templates/adminui-switcher.html",
            link: function(scope, elem, attrs) {
                $timeout(function() {
                    scope.onLabel = scope.onLabel ? scope.onLabel : '<i class="glyphicon glyphicon-ok"></i>';
                    scope.offLabel = scope.offLabel ? scope.offLabel : '<i class="glyphicon glyphicon-remove"></i>';
                    $timeout(function() {
                        var switcher = new Switcher(elem, scope.model, scope.disabled);
                        elem.bind("click", function(e) {
                            var switchedFunc = null;
                            var clickEvent = null;
                            if (!switcher.onAnimate && !scope.disabled) {
                                if (e.button !== 0) {
                                    return;
                                }
                                clickEvent = {
                                    $event: {
                                        type: "SWITCHER_CLICK",
                                        name: "click",
                                        target: elem,
                                        oldValue: scope.model,
                                        value: !scope.model,
                                        switched: function(callback) {
                                            switchedFunc = callback;
                                        }
                                    }
                                };
                                scope.ngClick(clickEvent);
                                switcher.switch(scope.model, function(value) {
                                    scope.$apply(function() {
                                        scope.model = value;
                                        if (switchedFunc !== null) {
                                            switchedFunc.call(clickEvent, value, !value);
                                        }
                                    });
                                });
                            }
                        });
                        scope.$watch("disabled", function(value, oldValue) {
                            if (value != oldValue) {
                                switcher.disabled(value);
                                switcher.switch(!scope.model, function(newValue) {
                                    scope.$apply(function() {
                                        scope.model = newValue;
                                    });
                                });
                            }
                        });
                        scope.$watch("model", function(value, oldValue) {
                            if (value !== oldValue && !scope.disabled) {
                                scope.ngChange({
                                    $event: {
                                        type: "SWITCHER_CHANGE",
                                        name: "change",
                                        target: elem,
                                        oldValue: oldValue,
                                        value: value
                                    }
                                });
                                switcher.switch(oldValue);
                            }
                        });
                    });
                });
            }
        };
    };
    ng.module("ntd.directives").directive("adminuiSwitcher", [ "$timeout", SwitcherDirective ]);
})(angular);

(function(ng, app) {
    "use strict";
    var List = function($timeout, selectBox, elem, scope) {
        this.items = [];
        this.options = [];
        this.$timeout = $timeout;
        this.selectBox = selectBox;
        this.selectBox.bind("change", {
            scope: scope
        }, this.change.bind(this));
        $timeout(function() {
            ng.forEach(selectBox.children("option"), function(option, index) {
                var optionEl = ng.element(option);
                if ($.trim(optionEl.text()) != "") {
                    this.options.push(optionEl);
                    this.items.push({
                        text: optionEl.text(),
                        value: optionEl.attr("value"),
                        selected: option.selected,
                        index: index
                    });
                }
            }, this);
            $timeout(function() {
                elem.find("li").bind("click", function(e) {
                    if (scope.disabled === true) {
                        return;
                    }
                    var index = elem.find("li").index(e.target);
                    ng.forEach(this.options, function(option, optionIndex) {
                        if (optionIndex == index) {
                            if (scope.multiple === true) {
                                option.get(0).selected = !option.get(0).selected;
                            } else {
                                option.get(0).selected = true;
                            }
                            option.change();
                        }
                    });
                }.bind(this));
            }.bind(this));
        }.bind(this));
    };
    List.prototype.change = function(e) {
        var selectedIndex = [];
        ng.forEach(this.selectBox.find("option:selected"), function(option) {
            selectedIndex.push(this.selectBox.find("option").index(option));
        }, this);
        ng.forEach(this.items, function(item) {
            if (e) {
                e.data.scope.$apply(function() {
                    item.selected = selectedIndex.indexOf(item.index) !== -1;
                });
            } else {
                item.selected = selectedIndex.indexOf(item.index) !== -1;
            }
        }, this);
    };
    List.prototype.clearSelected = function() {
        ng.forEach(this.items, function(item) {
            item.selected = false;
        });
    };
    var ListDirective = function($compile, $timeout, $parse) {
        return {
            restrict: "A",
            scope: true,
            replace: true,
            templateUrl: "templates/adminui-list.html",
            link: function(scope, elem, attrs) {
                var list = null;
                var options = attrs["ngOptions"];
                var NG_OPTIONS_REGEXP = new RegExp("^\\s*([\\s\\S]+?)(?:\\s+as\\s+([\\s\\S]+?))" + "?(?:\\s+group\\s+by\\s+([\\s\\S]+?))?\\s+for\\s+" + "(?:([\\$\\w][\\$\\w]*)|(?:\\(\\s*([\\$\\w][\\$\\w]*)\\s*,\\s*" + "([\\$\\w][\\$\\w]*)\\s*\\)))\\s+in\\s+" + "([\\s\\S]+?)(?:\\s+track\\s+by\\s+([\\s\\S]+?))?$");
                var optionsMatch = options.match(NG_OPTIONS_REGEXP);
                var optionModelName = optionsMatch[7];
                var selectBox = ng.element("<select>").attr("ng-options", options).attr("ng-change", attrs["ngChange"]).attr("ng-model", attrs["ngModel"]).append(ng.element("<option>"));
                scope.disabled = $parse(attrs["disabled"])(scope);
                scope.multiple = $parse(attrs["multiple"])(scope);
                if (scope.multiple === true) {
                    selectBox.attr("multiple", true);
                }
                selectBox = $compile(selectBox)(scope);
                scope.$parent.$watch(attrs["disabled"], function(value) {
                    scope.disabled = value;
                }, true);
                scope.$watch(attrs["ngModel"], function(value, oldValue) {
                    if (value !== oldValue) {
                        scope.$parent[attrs["ngModel"]] = value;
                        list.change();
                    }
                }, true);
                scope.$parent.$watch(attrs["ngModel"], function(value, oldValue) {
                    if (value !== oldValue) {
                        scope[attrs["ngModel"]] = value;
                        list.change();
                    }
                }, true);
                scope.$watch(optionModelName, function(value, oldValue) {
                    list = new List($timeout, selectBox, elem, scope);
                    scope.listItems = list.items;
                    if (value !== oldValue) {
                        list.clearSelected();
                        scope[attrs["ngModel"]] = null;
                    }
                }, true);
            }
        };
    };
    app.directive("adminuiList", [ "$compile", "$timeout", "$parse", ListDirective ]);
})(angular, angular.module("ntd.directives"));

(function(ng) {
    "use strict";
    var AdminuiDaterange = function($compile, $parse) {
        return {
            restrict: "A",
            require: "ngModel",
            link: function($scope, $element, $attributes, ngModel) {
                var options = {};
                options.format = $attributes.format || "YYYY-MM-DD";
                options.separator = $attributes.separator || " - ";
                options.minDate = $attributes.minDate && moment($attributes.minDate);
                options.maxDate = $attributes.maxDate && moment($attributes.maxDate);
                options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(" ").map(function(elem, index) {
                    return index === 0 && parseInt(elem, 10) || elem;
                }));
                options.ranges = $attributes.ranges && $parse($attributes.ranges)($scope);
                options.locale = $attributes.locale && $parse($attributes.locale)($scope);
                options.opens = $attributes.opens || "right";
                function format(date) {
                    return date.format(options.format);
                }
                function formatted(dates) {
                    return [ format(dates.startDate), format(dates.endDate) ].join(options.separator);
                }
                ngModel.$formatters.unshift(function(modelValue) {
                    if (!modelValue) return "";
                    return modelValue;
                });
                ngModel.$parsers.unshift(function(viewValue) {
                    return viewValue;
                });
                $scope.$watch($attributes.ngModel, function(modelValue) {
                    if (!modelValue || !modelValue.startDate) {
                        ngModel.$setViewValue({
                            startDate: moment().startOf("day").toDate(),
                            endDate: moment().startOf("day").toDate()
                        });
                        return;
                    }
                    $element.data("daterangepicker").startDate = moment(modelValue.startDate);
                    $element.data("daterangepicker").endDate = moment(modelValue.endDate);
                    $element.data("daterangepicker").updateView();
                    $element.data("daterangepicker").updateCalendars();
                    $element.data("daterangepicker").updateInputText();
                });
                $element.daterangepicker(options, function(start, end) {
                    $scope.$apply(function() {
                        ngModel.$setViewValue({
                            startDate: start.toDate(),
                            endDate: end.toDate()
                        });
                    });
                });
            }
        };
    };
    ng.module("ntd.directives").directive("adminuiDaterangePicker", [ "$compile", "$parse", AdminuiDaterange ]);
})(angular);

angular.module("ntd.directives").run([ "$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("templates/adminui-frame.html", '<nav class="navbar navbar-inverse navbar-fixed-top" role=navigation><div class=container-fluid><div class=navbar-header><button class=navbar-toggle type=button data-toggle=collapse data-target=.bs-navbar-collapse><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a class=navbar-brand href="../"></a></div><div class="collapse navbar-collapse bs-navbar-collapse"><ul class="nav navbar-nav main-nav"><li data-ng-repeat="nav in navigation" data-ng-class="{true: \'active\', false: \'\'}[nav.children != null]"><a data-ng-href={{nav.url}} data-ng-show=nav.show>{{nav.name}}</a><ul class=sub-navbar data-ng-if="nav.children != null" data-ng-class="{false: \'no-parent\'}[nav.show]"><li data-ng-repeat="subnav in nav.children" data-ng-show=subnav.show data-ng-class="{true: \'active\', false: \'\'}[isSelected(subnav)]"><a data-ng-click=selectNav(subnav) data-ng-href={{subnav.url}}>{{subnav.name}}</a></li></ul></li></ul><ul class="nav navbar-nav navbar-right"><li class=dropdown><a data-ng-show=isMessageBoxShow class=dropdown-toggle href=# data-toggle=dropdown><span class=badge data-ng-show="messages.length > 0">{{messages.length}}</span> <i class="glyphicon glyphicon-inbox"></i></a><ul data-ng-show=isMessageBoxShow class=dropdown-menu><li data-ng-repeat="message in messages"><a href=#>{{message.title}}</a></li><li class=divider></li><li><a href=#><i class="glyphicon glyphicon-chevron-right pull-right"></i> 查看全部</a></li></ul></li><li data-ng-hide=noSideMenu data-ng-class="{true: \'active\', false: \'\'}[isSubMenuShow]"><a href=javascript:; data-ng-click=toggleSubMenu($event)><i class="glyphicon glyphicon-list"></i></a></li><li data-ng-show="userInfo.username != null" class=dropdown><a class=dropdown-toggle href=# data-toggle=dropdown>您好，{{userInfo.username}}<b class=caret></b></a><ul class=dropdown-menu><li class=user-information><img data-ng-src={{userInfo.avatar}} alt=user_avatar><div class="user-content muted">{{userInfo.username}}</div></li><li class=divider></li><li><a data-ng-click=changePwd($event) href=#><i class="glyphicon glyphicon-lock"></i> 修改密码</a></li><li><a data-ng-click=logout($event) href=#><i class="glyphicon glyphicon-off"></i> 退出</a></li></ul></li><li class=dropdown data-ng-show="userInfo.username != null && accountHost != null "><a class=dropdown-toggle href=# data-toggle=dropdown>常用 <b class=caret></b></a><ul class=dropdown-menu><li data-ng-repeat="menu in commonMenus"><a data-ng-href={{menu.link}}>{{menu.name}}</a></li><li data-ng-show="commonMenus.length <= 0" class=none-info>暂无常用菜单</li><li class=divider></li><li><a href=javascript:; data-ng-click=addCommonMenu()>添加为常用</a></li><li><a data-ng-href={{accountHost}}/#/menus>管理常用菜单</a></li></ul></li></ul></div></div><nav class=sub-navbar-back data-ng-show=hasSubNav></nav></nav><div class=container-fluid><div class="row fix-row"><div class="col-md-2 container-fluid" data-ng-show=hasSideMenu><div data-ng-show=isSubMenuShow class=row><div class="col-md-2 affix side-nav"><h4>{{sideMenuName}}</h4><ul class=side-nav-menu><li data-ng-repeat="sidemenu in menu" data-ng-class="{true: \'active\', false: \'\'}[isSelected(sidemenu)]"><a data-ng-href={{sidemenu.url}} data-ng-class="{true: \'has-sub-menu\', false: \'\'}[sidemenu.children != null]" data-ng-click="selectMenu(sidemenu, $event)"><i class="pull-right glyphicon glyphicon-chevron-down" data-ng-show="sidemenu.children != null"></i>{{sidemenu.name}}</a><ul data-ng-if="sidemenu.children != null"><li data-ng-repeat="subsidemenu in sidemenu.children" data-ng-class="{true: \'active\', false: \'\'}[isSelected(subsidemenu)]"><a data-ng-click="selectMenu(subsidemenu, $event)" data-ng-href={{subsidemenu.url}}>{{subsidemenu.name}}</a></li></ul></li></ul></div></div></div><div data-ng-class="{true: \'col-md-offset-2\', false: \'\'}[isSubMenuShow && hasSideMenu]" class="message-container flash-alert"></div><div data-ng-class="{true: \'col-md-offset-2\', false: \'\'}[isSubMenuShow && hasSideMenu]" class="message-container notice"></div><div data-ng-class="{true: \'col-md-10\', false: \'col-md-12\'}[isSubMenuShow && hasSideMenu]" data-ng-transclude=""></div><div data-adminui-load-backdrop="" class=load-backdrop style=display:none><div class=splash><img class=loading src=images/ajax-loader.gif alt=加载中></div></div></div></div>');
    $templateCache.put("templates/adminui-list.html", '<ul class=adminui-list-container data-ng-class="{true: \'disabled\'}[disabled]"><li data-ng-repeat="item in listItems" data-ng-class="{true: \'selected\'}[item.selected]">{{item.text}}</li></ul>');
    $templateCache.put("templates/adminui-switcher.html", "<div class=adminui-switcher-container><div class=adminui-switcher-inner><div class=on-label data-ng-bind-html=onLabel></div><div class=divider></div><div class=off-label data-ng-bind-html=offLabel></div><div class=ng-hide><input type=checkbox data-ng-model=model></div></div></div>");
    $templateCache.put("templates/checkbox-group.html", "<div class=\"dropdown dropdown-checkbox-group\"><label class=dropdown-toggle data-toggle=dropdown><input type=checkbox data-ng-click=toggleCheckedAll() data-ng-class=\"{'part': 'part-checked'}[status]\" data-ng-checked=\"{'all': true, 'part': true, 'none': false}[status]\">{{dataSource.name}} <b class=caret></b></label><ul class=dropdown-menu><li data-ng-repeat=\"checkbox in dataSource.checkboxGroup\"><label><input type=checkbox data-ng-model=checkbox.checked>{{checkbox.name}}</label></li><li data-ng-show=\"dataSource.checkboxGroup.length <= 0\"><label>无可选项目</label></li></ul></div>");
    $templateCache.put("templates/common-menu-dialog.html", '<div class=modal-header><h3>将当前地址加入常用菜单</h3></div><div class=modal-body data-ng-keypress=add($event)><form class=form-horizontal><div class=form-group><label class="col-sm-2 control-label" for="">地址</label><div class=col-sm-9><input class="form-control input-sm" data-ng-model=menu.link readonly></div></div><div class=form-group><label class="col-sm-2 control-label" for="">名称</label><div class=col-sm-9><input class="form-control input-sm" data-ng-model=menu.name></div></div></form></div><div class=modal-footer><button class="btn btn-primary" data-ng-click=add($event)>添加</button> <button class="btn btn-default" data-ng-click=cancel($event)>取消</button></div>');
    $templateCache.put("templates/finder.html", '<div class=adminui-finder-container><div class=adminui-finder-inner>{{selectedItems}}<ul data-ng-repeat="list in finderList" style="margin-left: {{30 * $index}}%" data-ng-class="{true: \'selected\'}[isLevelSelected($index)]"><li data-ng-click="showChildren(item, $event)" data-ng-class="[{true: \'selected\'}[isItemSelected(item, $parent.$index)], {true: \'has-child\'}[hasChildren(item)]]" data-ng-repeat="item in list">{{item.text}}</li></ul></div></div>');
} ]);