var Notification = function(notification)
{
    this.notification = notification;
    
    this.listCardWasAddedTo = function()
    {
        if(new IterableCollection(["action_create_card","action_copy_card","action_email_card"]).hasMember(this.notification.action.display.translationKey))
            var ret = new List(this.notification.action.display.entities.list);
        else if(new IterableCollection(["action_move_card_to_board","action_convert_to_card_from_checkitem"]).hasMember(this.notification.action.display.translationKey))
            var ret = new List(this.notification.action.data.list);
        else if(new IterableCollection(["action_move_card_from_list_to_list"]).hasMember(this.notification.action.display.translationKey))
            var ret = new List(this.notification.action.display.entities.listAfter);
        else
            writeInfo_("not present: "+this.notification.action.display.translationKey);
        
        return ret;
    }

    this.card = function()
    {
        return new Card(this.notification.action.display.entities.card);
    }
}
