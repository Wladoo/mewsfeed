use hdk::prelude::*;
use mews_integrity::*;
use crate::mew::get_mew_with_context;

#[hdk_extern]
pub fn get_all_mews(_: ()) -> ExternResult<Vec<Record>> {
    let hashes = get_all_mew_hashes()?;
    let get_input: Vec<GetInput> = hashes
        .into_iter()
        .map(|hash| GetInput::new(
            ActionHash::from(hash).into(),
            GetOptions::default(),
        ))
        .collect();
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();

    Ok(records)
}

#[hdk_extern]
pub fn get_all_mews_with_context(_: ()) -> ExternResult<Vec<FeedMew>> {
    let hashes = get_all_mew_hashes()?;

    let feedmews: Vec<FeedMew> = hashes
        .into_iter()
        .filter_map(|hash| get_mew_with_context(hash).ok())
        .collect();

    Ok(feedmews)
}

fn get_all_mew_hashes() -> ExternResult<Vec<ActionHash>> {
    let path = Path::from("all_mews");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AllMews, None)?;
    let hashes: Vec<ActionHash> = links
        .into_iter()
        .map(|link|ActionHash::from(link.target).into())
        .collect();
    
    Ok(hashes)
}