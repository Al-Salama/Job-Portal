/*  Special validation is for checking for an input value and making
    sure that it meets specific requirements.   */

const validateSettings = {
    'name': [notEmpty, noSpecialCharacters, correctName, shortLength],
    'id-number': [notEmpty, idNumber],
    'birthDate': [correctBirthday],
    'marital-status': [isSelected],
    'marital-status-other': [notEmpty, noSpecialCharacters, shortLength],
    'nationality': [isSelected],
    'phone': [phoneNumber],
    'city': [isSelected],
    'address': [notEmpty, noHardSpecialCharacters, shortLength],
    'email': [emailAdress, shortLength],
    'cv': [filesNotEmpty, fileTypeRestriction, fileSizeLimit],
    'degree': [isSelected],
    'graduate-date': [integerOnly, yearOnly],
    'gpa': [gpaOnly],
    'field': [notEmpty, noHardSpecialCharacters, shortLength],
    'certificate': [filesNotEmpty, fileTypeRestriction, fileSizeLimit],
    'course-name': [notEmpty, noHardSpecialCharacters, shortLength],
    'course-certificate': [fileTypeRestriction, fileSizeLimit],
    'experience-employer': [notEmpty, noHardSpecialCharacters, shortLength],
    'experience-title': [notEmpty, noHardSpecialCharacters, shortLength],
    'experience-years': [integerOnly, positiveNumber, shortLength],
    'experience-quit': [notEmpty, noHardSpecialCharacters, shortLength],
    'experience-salary': [integerOnly, positiveNumber, shortLength],
    'experience-certificate': [filesNotEmpty, fileTypeRestriction, fileSizeLimit],
    'computer-rate': [isSelected],
    'english-rate': [isSelected],
    'flexibility-rate': [isSelected],
    'self-talk': [notEmpty, paragraphLength]
}

/*
Special inputs validation functions require the input element in thier argument
instead of the input value;
*/
const specialInputs = {
    'marital-status': true,
    'nationality': true,
    'city': true,
    'cv': true,
    'degree': true,
    'certificate': true,
    'course-certificate': true,
    'experience-certificate': true,
    'computer-rate': true,
    'english-rate': true,
    'flexibility-rate': true,
}

const allowedFiles = {
    application: {
        'pdf': true
    },
    image: {
        'png': true,
        'jpeg': true,
        'jpg': true
    }
}

function validateForm(rootElement = ".application-section"){
    const allInputs = document.querySelectorAll(`${rootElement} input,${rootElement} select,${rootElement} textarea`);
    let inputValidateSettings;
    let errorInfo;
    let inputValue;
    const errors = [];
    const sexChecks = {};
    for (const input of allInputs) {
        inputValidateSettings = validateSettings[input.id]
        if (inputValidateSettings) {

            if (specialInputs[input.id])
                inputValue = input;
            else
                inputValue = `${input.value}`
            ;

            for (const validateFunc of inputValidateSettings) {
                errorInfo = validateFunc(inputValue);
                if (!errorInfo.isValid){
                    errors.push({
                        id: input.id,
                        reason: errorInfo.reason
                    });
                    break;
                }
            }
        } else {
            let errorMessage;
            if (input.id === "male") {
                if (!input.checked && 'female' in sexChecks && !sexChecks.female) {
                    errorMessage = {
                        id: "sex",
                        reason: "هذا القسم مطلوب!"
                    }
                }
                sexChecks.male = input.checked;
            } else if (input.id === "female") {
                if (!input.checked && 'male' in sexChecks && !sexChecks.male) {
                    errorMessage = {
                        id: "sex",
                        reason: "هذا القسم مطلوب!"
                    }
                }
                sexChecks.female = input.checked;
            }
            if (errorMessage) errors.push(errorMessage);
        }
    }
    return errors;
}


function notEmpty(string){
    return {
        isValid: /[a-zA-Z0-9\u0621-\u064A\u0660-\u0669]{3,}/u.test(string),
        reason: "يجب ملء هذا الحقل!"
    }
}

function noSpecialCharacters(string) {
    return {
        isValid: /^[a-zA-Z0-9\u0621-\u064A\u0660-\u0669 ]+$/gu.test(string),
        reason: "لايسمح بالرموز في هذا الحقل"
    }
}

function noHardSpecialCharacters(string) {
    return {
        isValid: /^[a-zA-Z0-9.,،\-\u0621-\u064A\u0660-\u0669 ]+$/gu.test(string),
        reason: "يسمح فقط بهذه الرموز: [. , ، -]"
    }
}

function integerOnly(string) {
    return {
        isValid: /^([1-9]{1}\d*|-[1-9]\d*)$/g.test(string),
        reason: "يسمح فقط بالأعداد الصحيحة"
    }
}

function positiveNumber(string) {
    return {
        isValid: Number(string) >= 0,
        reason: "يسمح فقط بالأعداد الموجبة"
    }
}

function gpaOnly(string) {
    return {
        isValid: /^(([1-9]\d?(?:\.\d+)?)|100)$/g.test(string),
        reason: "يرجى التأكد من صحة الإدخال"
    }
}

function phoneNumber(string) {
    return {
        isValid: /^0+5[0-9]{8}$/g.test(string),
        reason: "يرجى إدخال رقم الجوال بصيغة 05..."
    }
}

function idNumber(string) {
    return {
        isValid: /^[12]{1}[0-9]{9}$/g.test(string),
        reason: "يرجى إدخال رقم هوية صالح"
    }
}

function correctName(string) {
    return {
        isValid:
        /^[a-zA-Z\u0621-\u064A\u0660-\u0669]{3,} [a-zA-Z\u0621-\u064A\u0660-\u0669]{3,} [a-zA-Z\u0621-\u064A\u0660-\u0669]{3,} [a-zA-Z\u0621-\u064A\u0660-\u0669]{3,}$/gu
        .test(string),

        reason: "يرجى إدخال الإسم الرباعي"
    }
}

function correctBirthday(string) {
    const regex = /(\d{4}([.\-/ ])\d{2}\2\d{2}|\d{2}([.\-/ ])\d{2}\3\d{4})/;
    const search = string.match(regex);
    const result = {
        isValid: false,
        reason: "غير معروف"
    }
    if (!search) {
        result.reason = "يرجى التأكد من إختيار التاريخ بشكل صحيح"
        return result;
    }

    let day, month, year;
    if (search[2]) { // the date format is: YYYY MM DD
        [year, month, day] = search[0].split(search[2])
    } else if (search[3]) { // the date format is: DD MM YYYY
        [day, month, year] = search[0].split(search[3])
    }
    if (
        typeof day != 'string' ||
        typeof month != 'string' ||
        typeof year != 'string'
    ) {
        result.reason = "حدث خطأ ما، يرجى المحاولة مرةً أخرى"
        return result;
    }

    const nowDate = new Date();
    const userDate = new Date()
    userDate.setFullYear(year, parseInt(month) - 1, day);

    const differance = nowDate - userDate;
    const diffranceYears = differance/1000/60/60/24/30.4375/12; // 30.4375 is because some months has 30,31 days
    if (diffranceYears < 0) {
        result.reason = "لايمكن أن يكون التاريخ في المستقبل"
    } else if (diffranceYears === 0) {
        result.reason = "يجب أن يكون هذا التاريخ في الماضي!"
    } else if (diffranceYears < 18) {
        result.reason = "يجب أن لايقل عمرك عن 18 سنة"
    } else {
        result.isValid = true;
    }
    return result;
}

function emailAdress(string) {
    return {
        isValid: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/g.test(string),
        reason: "أدخل بريدك الإلكتروني بشكلٍ صحيح"
    }
}

function yearOnly(string) {
    const year = Number(string)
    return {
        isValid: year >= 1900 && year <= 2099,
        reason: "يجب التأكد من إدخال السنة الميلادية"
    }
}

function isSelected(input) {
    return {
        isValid: input.selectedIndex > 0,
        reason: "يرجى تحديد خيار من الخيارات المتاحة"
    }
}

function filesNotEmpty(input){
    return {
        isValid: input.files.length > 0,
        reason: "هذا القسم مطلوب"
    }
}

function fileTypeRestriction(input) {
    const file = input.files[0];
    let isAllowedFile;
    if (file) {
        const [documentType, extension] = file.type.split("/");
        isAllowedFile = allowedFiles[documentType]? allowedFiles[documentType][extension]: false;
    }

    return {
        isValid: isAllowedFile || !file,
        reason: `الملفات المسموحة: [ ${Object.keys(allowedFiles.application).join(" , ")} , ${Object.keys(allowedFiles.image).join(" , ")} ]`
    }
}

function fileSizeLimit(input){
    const file = input.files[0];
    const maxSize_MB = 10
    let isAllowedSize;
    if (file) {
        isAllowedSize = file.size <= (maxSize_MB * 1024 * 1024)
    }

    return {
        isValid: isAllowedSize || !file,
        reason: `يجب أن لايتجاوز حجم الملف عن ${maxSize_MB.toLocaleString("ar-SA")} ميجا بايت`
    }
}

function paragraphLength(string) {
    const maxCharacters = 5000;
    return {
        isValid: string.length <= maxCharacters,
        reason: `يجب أن لايتجاوز طول النص عن ${maxCharacters.toLocaleString("ar-SA")} حرف`
    }
}

function shortLength(string) {
    const maxCharacters = 100;
    return {
        isValid: string.length <= maxCharacters,
        reason: `يجب أن لايتجاوز طول النص عن ${maxCharacters.toLocaleString("ar-SA")} حرف`
    }
}

export default validateForm;