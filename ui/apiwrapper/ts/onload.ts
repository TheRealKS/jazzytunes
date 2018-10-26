//All the actions to be executed on window load go here
document.addEventListener("dom:loaded", function(){
    document.getElementById("authorize").addEventListener("click", startAuthProcess);
});