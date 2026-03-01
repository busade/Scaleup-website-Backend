import mongoose from 'mongoose';

const volunteerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  location: { type: String, required: true },
  linkedIn: { type: String, required: true },
  skills: [{
    type: String,
    enum: [
      'UI/UX Design',
      'Operations/Product management',
      'Marketing and media',
      'Software engineering',
      'Content creation',
      'Quality Assurance',
      'Event outreach/Lead generations'
    ]
  }],
  availability: { type: String, required: true }, // hours per week
  whyVolunteer: { type: String, required: true },
  relevantExperience: { type: String }, // link or text
  cv: { type: String } // link or path
}, {
  timestamps: true
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer;
