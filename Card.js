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
    this.checklist_list  = null;
    this.attached_link   = null;

    this.board = function()
    {
        if(!this.data.idBoard)
            this.load();
        
        return new Board({id: this.data.idBoard});
    }

    this.link = function()
    {
        if(!this.data.shortLink)
            this.load();
        
        return "https://trello.com/c/"+this.data.shortLink;
    }
    
    this.attachLink = function(link)
    {
        this.attached_link = TrelloApi.post("cards/"+this.data.id+"/attachments?url="+encodeURIComponent(link));
        return this;
    }

    this.name = function()
    {
        if(!this.data.name && !this.data.text)
            this.load();

        return this.data.name ? this.data.name:this.data.text;
    }
    
    this.member = function(data)
    {
        return this.members(data).first();
    }
    
    this.members = function(data)
    {
        if(!this.data.members)
        {
            this.data.members = this.iterableCollection("cards/"+this.data.id+"/members?fields=username",data,function(elem)
            {
                return new Member(elem);
            });
        }
                       
        return this.data.members;
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
        var position = (data.position)?data.position:"bottom";
        this.moved = TrelloApi.put("cards/"+this.data.id+"?idList="+list_id+"&pos="+position);
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
    
    this.checklist = function(name)
    {
        return this.checklists(name).first();
    }

    this.checklists = function(name)
    {
        if(!this.checklist_list)         
        {
            this.checklist_list = new IterableCollection(TrelloApi.get("cards/"+this.data.id+"/checklists")).transform(function(elem)
            {
              return new Checklist(elem);
            }).filterByName(name);
        }

        return this.checklist_list;
    }

    this.addChecklist = function(name,callback)
    {
        try
        {
            var checklist = this.checklist(name);
        }
        
        catch(e)
        {
            var checklist = new Checklist(TrelloApi.post("cards/"+this.data.id+"/checklists?name="+encodeURIComponent(name)));
            this.added_checklist = checklist;
        }

        callback(checklist);
        return this;
    }

    this.load = function()
    {
        this.data = TrelloApi.get("cards/"+this.data.id+"?fields=all&actions=all&attachments=true&attachment_fields=all&member_fields=all&memberVoted_fields=all&checklists=all&checklist_fields=all&board=true&board_fields=all&list=true&pluginData=true&stickers=true&sticker_fields=all");
        return this;
    }

    this.addLabel = function(label_name)
    {
        try
        {
            var label = this.board().label({name: label});
            this.applyLabelIds(new IterableCollection([label.data.id]));
        }
        
        catch(e)
        {
            this.addNewLabels(new IterableCollection([label_name]));
        }
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
    
    this.iterableCollection = function(url,data,callback)
    {
        var ret = new IterableCollection(TrelloApi.get(url));

        ret.transform(callback);

        if(data && data.name)
            ret.filterByName(data.name);
        
        return ret;
    }
}

Card.create = function(list,data)
{
    return new Card(TrelloApi.post("cards?idList="+list.data.id+"&"+new IterableCollection(data).implode("&",encodeURIComponent)));
}

Card.findOrCreate = function(list,data)
{
    var cards = list.cards(data);
    
    try
    {
        var ret = cards.first();
    }
    
    catch(e)
    {
        var ret = Card.create(list,data);
    }
    
    return ret;
}
