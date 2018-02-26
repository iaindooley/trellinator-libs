var TestConnector = function(stream)
{
    this.stream = stream;

    this.fetch = function(url,options)
    {
        stream.write(JSON.stringify(options)+"\n");
        stream.write(url+"\n");
    }
}
