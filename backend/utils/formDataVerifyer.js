function getFormData(req) {
    return new Promise((resolve) => {
        const form = formidable({});
        form.parse(req, (error, fields, files) => {
            resolve({ error, fields, files })
        });
    })
}
import formidable from "formidable";
const requiredInfo = {
    fields: [
        'name',
        'sex',
        'idNumber',
        'birthDate',
        'maritalStatus',
        'nationality',
        'phone',
        'city',
        'address',
        'email',
        'degree',
        'graduateDate',
        ['gpa', 'field'], // Meaning: at least one of them must be exist.
        'computerRate',
        'englishRate',
        'flexibilityRate',
        'selfTalk'
    ],
    files: [
        'cv',
        'certificate',
    ],
    experience: [
        'employer',
        'title',
        'years',
        'quit'
    ]
    // 'experience-certificate',
}
export default async function formVerifyer(req, res, next){
    const form = await getFormData(req);
    if (form.error) {
        res.status(400)
            .json({
                success: false,
                code: 400,
                message: "Bad request - You need to fill the form data"
            })
        console.error(form.error)
        return;
    }
    const isDataVerified = verifyApplicationData(form.fields, form.files)
    if (!isDataVerified) {
        res.status(400)
            .json({
                success: false,
                code: 400,
                message: "Bad request - You need to fill the form data"
            })
        return;
    }

    if (form.fields.courses) {
        let courses;
        try {
            courses = JSON.parse(form.fields.courses);
        } finally {
            if (!courses || typeof courses !== "object") form.fields.courses = null;
        }
    } else {
        form.fields.courses = null;
    }

    if (form.fields.experiences) {
        let experiences;
        try {
            experiences = JSON.parse(form.fields.experiences);
        } finally {
            if (!experiences || typeof experiences !== "object") form.fields.experiences = null;
        }
    } else {
        form.fields.experiences = null;
    }
    if (!form.fields.gpa) form.fields.gpa = null;
    if (!form.fields.field) form.fields.field = null;

    req.form = form;
    next();
}

function verifyApplicationData(fields = {}, files = {}) { // Making sure that the user has provided all the requaired data.
    let verified;
    for (const name of requiredInfo.fields) {
        verified = false;
        if (typeof name === "string") {
            if (name in fields) {
                verified = true;
            }
        } else if (Array.isArray(name)) {
            for (const nameInArray of name) {
                if (nameInArray in fields) {
                    verified = true;
                    break;
                }
            }
        }
        if (!verified) {
            return false;
        }
    }
    if (fields.experiences) {
        let experiences
        try { experiences = JSON.parse(fields.experiences) } catch (error) {
            console.error(error);
        }
        if (experiences) {
            for (const experienceItem of experiences) {
                for (const name of requiredInfo.experience) {
                    verified = false;
                    if (typeof name === "string") {
                        if (name in experienceItem) {
                            verified = true;
                        }
                    } else if (Array.isArray(name)) {
                        for (const nameInArray of name) {
                            if (nameInArray in experienceItem) {
                                verified = true;
                                break;
                            }
                        }
                    }
                    if (!verified) {
                        return false;
                    }
                }
            }
            if (experiences.length > 0 && !('expertiseCertificate' in files)) {
                return false;
            }
        }
    }

    for (const name of requiredInfo.files) {
        verified = false;
        if (typeof name === "string") {
            if (name in files) {
                verified = true;
            }
        } else if (Array.isArray(name)) {
            for (const nameInArray of name) {
                if (nameInArray in files) {
                    verified = true;
                    break;
                }
            }
        }
        if (!verified) {
            return false;
        }
    }

    return true;
}