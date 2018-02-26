var Board = function(data)
{    
    this.data = data;
  
    this.moveAllCards = function(data)
    {
        //data.from == RegExp, data.to == RegExp
        var lists = TrelloApi("key","token").get("boards/"+this.data.id+"/lists/open");

https://api.trello.com/1/boards/nmWXD05b/lists/open?key=fbd7dbac07f0b9476434fa48cf6cb2dd&token=dc1224ae737e40c1e2ffb53195c28942b3c5399a8916b48796120a4e68f4ee60'
    }

    this.list = function()
    {
        //{name: new RegExp(list_name+" \\([0-9]+\\)")});
    }
    
    return this;
}
