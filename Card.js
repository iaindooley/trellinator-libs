Trellinator.Card(notification.cardId).postComment("@"+notification.boardName+" you asked me to remind you about this");
Trellinator.Card(notification.cardId).setDue("in 3 working days");
Trellinator.Card(notification.cardId).moveTo({list:"Priority",position:2});
var Card = function(data)
{    
    this.data = data;
  
    this.moveAllCards = function(data)
    {
        //data.from == RegExp, data.to == RegExp
    }

    this.list = function()
    {
        //{name: new RegExp(list_name+" \\([0-9]+\\)")});
    }
    
    return this;
}
