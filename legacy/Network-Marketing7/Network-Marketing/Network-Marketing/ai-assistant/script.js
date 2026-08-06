let db =
JSON.parse(localStorage.getItem("SMA"))
||
{
questions:[]
};



function search(){


let companyValue =
company.value.toLowerCase();


let sectionValue =
section.value.toLowerCase();


let userQuestion =
question.value.toLowerCase();


let result =
"لم أجد إجابة مناسبة.";



db.questions.forEach(item=>{


let itemCompany =
(item.company || "").toLowerCase();


let itemSection =
(item.section || "").toLowerCase();


let itemQuestion =
item.question.toLowerCase();


let keys =
item.keywords.toLowerCase();



if(

itemCompany.includes(companyValue)

&&

itemSection.includes(sectionValue)

&&

(
itemQuestion.includes(userQuestion)

||

keys.includes(userQuestion)

)

)

{

result = item.answer;


if(item.showContact === "نعم"){

result += `

<br><br>

📌 رمز الراعي: 829134401

<br>

🔗 رابط التسجيل:

<a href="https://eworld.dxn2u.com/s/accreg/ar/829134401" target="_blank">
اضغط هنا للتسجيل
</a>

<br><br>

📱 واتساب:

<a href="https://wa.me/218946098624" target="_blank">
+218946098624
</a>

`;

}

}


});



answer.innerHTML=result;


}
