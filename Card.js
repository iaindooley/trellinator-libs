var Card = function(data)
{    
    this.data            = data;
    this.last_comment    = null;
    this.set_due         = null;
    this.moved           = null;
    this.set_description = null;
    this.archived        = null;
    this.unarchived      = null;
    this.added_checklist = null;
  
    this.name = function()
    {
        if(!this.data.name)
            this.load();
        
        return this.data.name;
    }
    
    this.description = function()
    {
        if(!this.data.desc)
            this.load();
        
        return this.data.desc;
    }

    this.labels = function()
    {
        if(!this.data.labels)
            this.load();

        var ret = new IterableCollection(this.data.labels);

        ret.transform(function(elem)
        {
            return new Label(elem);
        });
        
        return ret;
    }
    
    this.setDescription = function(desc)
    {
        this.set_description = TrelloApi.put("cards/"+this.data.id+"?desc="+encodeURIComponent(desc));
        return this;
    }

    this.postComment = function(comment_text)
    {
        this.last_comment = TrelloApi.post("cards/"+this.data.id+"/actions/comments?text="+encodeURIComponent(comment_text));
        return this;
    }

    this.setDue = function(datetime)
    {
        this.set_due = TrelloApi.put("cards/"+this.data.id+"?due="+encodeURIComponent(datetime));
        return this;
    }

    this.moveTo = function(data)
    {
        if(!this.data.board)
            this.load();

        var list_id = new Board(this.data.board).list({name: data.list}).data.id;
        this.moved = TrelloApi.put("cards/"+this.data.id+"?idList="+list_id+"&pos="+data.position);
        return this;
    }
    
    this.archive = function()
    {
        this.archived = TrelloApi.put("cards/"+this.data.id+"?closed=true");
        return this;
    }

    this.unArchive = function()
    {
        this.unarchived = TrelloApi.put("cards/"+this.data.id+"?closed=false");
        return this;
    }
    
    this.addChecklist = function(name,callback)
    {
        var checklist = new Checklist(TrelloApi.post("cards/"+this.data.id+"/checklists?name="+encodeURIComponent(name)));
        this.added_checklist = checklist;
        callback(checklist);
        return this;
    }

    this.load = function()
    {
        this.data = TrelloApi.get("cards/"+this.data.id+"?fields=all&actions=all&attachments=true&attachment_fields=all&member_fields=all&memberVoted_fields=all&checklists=all&checklist_fields=all&board=true&board_fields=all&list=true&pluginData=true&stickers=true&sticker_fields=all");
        return this;
    }

    this.addNewLabels = function(new_labels)
    {
        new_labels.each(function(label)
        {
            try
            {
                TrelloApi.post("cards/"+this.data.id+"/labels?color=null&name="+encodeURIComponent(label));
            }
            
            catch(e)
            {
            }
        }.bind(this));
        
        return this;
    }

    this.applyLabelIds = function(label_ids)
    {
        label_ids.each(function(id)
        {
            try
            {
                TrelloApi.post("cards/"+this.data.id+"/idLabels?value="+encodeURIComponent(id));
            }
            
            catch(e)
            {
            }
        }.bind(this));

        return this;
    }
}
