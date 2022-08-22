const db = require("../models");
const Words = db.words;
const textToSpeech = require('@google-cloud/text-to-speech');


// Create and Save a new Words
exports.create = (req, res) => {
  delete req.body._id;
  // Validate request
  // if (!req.body.login || !req.body.password) {
  //   res.status(400).send({ message: "Content can not be empty!" });
  //   return;
  // }

  // Create a Words
  const words = new Words({
    mot: req.body.mot,
    definition: req.body.definition,
    published: req.body.published ? req.body.published : false
  });

  // Save Words in the database
  words
    .save(words)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Words."
      });
    });
};

// Retrieve all words from the database.
exports.findAll = (req, res) => {
  const title = req.query.mot;
  var condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

  Words.find(condition)
    .then(data => {
      console.log("words");
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving words."
      });
    });
};

// Find a single Words with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Words.findById(id)
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Words with id " + id });
      else res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Words with id=" + id });
    });
};

// Update a Words by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id;

  Words.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Words with id=${id}. Maybe Words was not found!`
        });
      } else res.send({ message: "Words was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Words with id=" + id
      });
    });
};

// Delete a Words with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Words.findByIdAndRemove(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Words with id=${id}. Maybe Words was not found!`
        });
      } else {
        res.send({
          message: "Words was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Words with id=" + id
      });
    });
};

// Delete all words from the database.
exports.deleteAll = (req, res) => {
  Words.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} words were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all words."
      });
    });
};

// Find all published words
exports.findAllPublished = (req, res) => {
  Words.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving words."
      });
    });
};

exports.textSpeech = async (req, res) => {

  const texte = req.body;

  const client = new textToSpeech.TextToSpeechClient();

  let data;
    // The text to synthesize
    const text = texte;

    // Construct the request
    const request = {
      input: {text: text},
      // Select the language and SSML voice gender (optional)
      voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
      // select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);

    data = response.audioContent;

    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');

    res.send(data);
}